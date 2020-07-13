import express = require('express');
import bodyParser = require('body-parser');
import inspector = require('inspector');
import bluebird = require('bluebird');
import cluster = require('cluster');
import http = require('http');
import {MethodParams, SessionPostResult, SetLogpoint, RemoveLogpoint, RemoveAllLogpoints, MethodType} from './Types';

// Todo: Arrange this shitty typescript
// Todo: Use Winston as logger
class DynamicLogger {
  private _session: inspector.Session;
  private _app: express.Application;
  private _isActive: boolean = false;
  private _isSessionConnected: boolean = false;

  public readonly LOGPOINT_ROUTE = '/logpoint';

  // Called on Master
  constructor() {
    this._session = new inspector.Session();
    this._app = express();
    this._app.use(bodyParser.json());
    this._app.use(bodyParser.urlencoded({
      extended: true
    }));

    this._app.post(this.LOGPOINT_ROUTE, this.setLogpoint.bind(this));
    this._app.delete(this.LOGPOINT_ROUTE, this.removeLogpoint.bind(this));

    this._app.use(this.errorHandler.bind(this));
  }

  // Called on Master
  public addLoggerToServer(server: http.Server) {
    this.addLoggerAppToServer(server);
  }

  // Called on Master
  public activate() {
    this.connectSession();
    this.sendInspectCmdToAllWorkers('connect');
    this._isActive = true;
  }

  // Called on Master
  public deactivate() {
    this._isActive = false;
    this.sendInspectCmdToAllWorkers('disconnect');
    this.disconnectSession();
  }

  public get isActive(): Readonly<boolean> {
    return this._isActive;
  }

  // Called on workers
  public listenOnWorker() {
    // Connecting immediately just in case we missed the 'connect' command.
    this.connectSession();

    cluster.worker.on('message', (msg) => {
      if (msg.type !== 'inspectCmd') {
        return;
      }
      switch (msg.cmd) {
        case 'setLogpoint': {
          this.setLogpointImp(msg.params);
          break;
        } case 'removeLogpoint': {
          this.removeLogpointImp(msg.params);
          break;
        } case 'disconnect': {
          this.disconnectSession();
          break;
        } case 'connect': {
          this.connectSession();
        } default: {
          console.error('Got unknown inspect command. command: ', msg.cmd)
        }
      }
    })
  }

  private connectSession() {
    if (this._isSessionConnected) {
      // Double connection throws error.
      return;
    }
    this._session.connect();
    this._isSessionConnected = true;
  }

  private disconnectSession() {
    this._session.disconnect();
    this._isSessionConnected = false;
  }

  private addLoggerAppToServer(server: http.Server) {
    server.on('request', (req, res) => {
      if (req.url === this.LOGPOINT_ROUTE && this._isActive) {
        this._app(req, res);
      }
    })
  }

  // Called on Master
  private async setLogpoint(req: express.Request, res: express.Response, next: express.NextFunction) {
    const params = {
      urlRegex: req.body.urlRegex,
      lineNumber: req.body.lineNumber,
      condition: `console.log(${req.body.message}) && false`
    };

    this.sendInspectCmdToAllWorkers('setLogpoint', params);

    bluebird.try(async () => {
      const logpoint = await this.setLogpointImp(params);
      res.send(logpoint);
    }).catch(e => next(e));
  }

  // Called on Master
  private async removeLogpoint(req: express.Request, res: express.Response, next: express.NextFunction) {
    let params: RemoveLogpoint['params'] | RemoveAllLogpoints['params'];
    if (req.body.breakpointId) {
      // Remove specific logpoint
      params = {
        breakpointId: req.body.breakpointId
      };
    } else {
      // Remove all logpoints
      params = {
        skip: true
      }
    }

    this.sendInspectCmdToAllWorkers('removeLogpoint', params);

    bluebird.try(async () => {
      const result = await this.removeLogpointImp(params);
      res.send(result);
    }).catch(e => next(e));
  }

  // Called on Master
  private async sendInspectCmdToAllWorkers(cmd: string, params?: MethodParams) {
    for (const id in cluster.workers) {
      if (cluster.workers[id] !== undefined) {
        cluster.workers[id]!.send({
          type: 'inspectCmd',
          cmd: cmd,
          params: params
        })
      }
    }
  }

  private async setLogpointImp(params: SetLogpoint['params']) {
    const logpoint = await this.postMethod('Debugger.setBreakpointByUrl', params);
    if (logpoint) {
      console.log("Added logpoint: ", JSON.stringify(logpoint));
    }
    return logpoint;
  }

  private async removeLogpointImp(params: RemoveLogpoint['params'] | RemoveAllLogpoints['params']) {
    let result;
    if ("skip" in params) {
      // Remove all breakpoints
      result = await this.postMethod('Debugger.setSkipAllPauses', params);
      console.log("Removed all logpoints: ", JSON.stringify(result));
    } else {
      result = await this.postMethod('Debugger.removeBreakpoint', params);
      console.log("Removed logpoint: ", JSON.stringify(result));
    }
    return result;
  }

  private async postMethod<T extends MethodType>(methodName: T['methodName'], params?: T['params']): Promise<SessionPostResult | unknown> {
    console.debug("Posting method: ", JSON.stringify(methodName), " with params: ", params);
    return new Promise((resolve, reject) => {
      this._session.post('Debugger.enable', {});

      this._session.post(methodName, params, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  }

  private errorHandler(err: any, req: any, res: any, next: any) {
    console.error("Error adding logpoint. Error: ", err);
    return res.status(err.status || 500).send(err.message);
  }
}

export = DynamicLogger;
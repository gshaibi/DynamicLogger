import express = require('express');
import bodyParser = require('body-parser');
import inspector = require('inspector');
import bluebird = require('bluebird');
import { Server } from 'http';

type MethodParams = {} | undefined;

export = class InspectServer {
  private session: inspector.Session;
  private app: express.Application;
  private server: Server | null = null;

  constructor(private port: number) {
    this.session = new inspector.Session();
    this.app = express();
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({
      extended: true
    }));

    this.app.post('/setLogpoint', this.setLogpoint.bind(this));
    this.app.post('/removeLogpoint', this.removeLogpoint.bind(this));

    this.app.use(this.errorHandler.bind(this));
  }

  public run() {
    this.session.connect();
    this.runServer();
  }

  public stop() {
    if (this.server) {
      this.server.close();
    }
    this.session.disconnect();
  }

  private runServer() {
    this.server = this.app.listen(this.port, () => console.log(`Dynamic logger listening at http://localhost:${this.port}`));
  }

  private async setLogpoint(req: express.Request, res: express.Response, next: express.NextFunction) {
    const params = {
      urlRegex: req.body.urlRegex,
      lineNumber: req.body.lineNumber,
      condition: `console.log(${req.body.message}) && false`
    }

    bluebird.try(async () => {
      const logpoint = await this.postMethod('Debugger.setBreakpointByUrl', params);
      console.log("Added logpoint: ", JSON.stringify(logpoint));
      res.send(logpoint);
    }).catch(e => next(e));
  }

  private async removeLogpoint(req: express.Request, res: express.Response, next: express.NextFunction) {
    const params = {
      breakpointId: req.body.logpointId,
    }

    bluebird.try(async () => {
      const result = await this.postMethod('Debugger.removeBreakpoint', params);
      console.log("Removed logpoint: ", JSON.stringify(result));
      res.send(result);
    }).catch(e => next(e));
  }

  private async postMethod(methodName: string, params: MethodParams): Promise<MethodParams> {
    console.debug("Posting method: ", JSON.stringify(methodName), " with params: ", params);
    return new Promise((resolve, reject) => {
      this.session.post('Debugger.enable', {});

      this.session.post(methodName, params, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    })
  }

  private errorHandler(err: any, req: any, res: any, next: any) {
    console.error("Error adding logpoint. Error: ", err);
    return res.status(err.status || 500).send('Error adding logpoint');
  }
}


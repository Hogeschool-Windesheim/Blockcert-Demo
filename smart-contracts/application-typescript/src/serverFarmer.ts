import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as express from 'express';
import {createServer} from 'http';
import {Network} from './network';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

export class ServerFarmer {

    static port = 4101;

    constructor(private _network: Network) {

    }

    /**
     * Start the server on the pre-specified port.
     * @param port integer representation on which port an identity must start.
     */
    start(port: string): void {
        const portNumber = parseInt(port, 10);
        createServer(app)
            .listen(portNumber, () => console.log(`Server started on ${portNumber}`));
        this._getListener();
    }

    private _getListener(): void {
        app.get('/certificate', async (req, res) => {
            // TODO what to do when action is not allowed, or crashes for whatever reason?
            let result;
            result = await this._network.contract.evaluateTransaction('queryAcquirer', this._network.userId);
            res.json({
                success: true,
                message: JSON.parse(result.toString()),
            });
        });
    }
}

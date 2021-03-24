import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as express from 'express';
import {createServer} from 'http';
import {Certificate} from '../../chaincode-typescript/dist/certificate';
import {Network} from './network';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

export class Server {

    constructor(private _network: Network) {

    }

    start(): void {
        createServer(app).listen(4100, () => console.log(`Server started on ${4100}`));
        this._getListener();
        this._putListener();
        this._deleteListener();
    }

    private _getListener(): void {
        app.get('/certificate', async (req, res) => {
            const result = await this._network.contract.evaluateTransaction('GetAllCertificates');
            console.log(result);
            res.json({
                success: true,
                message: JSON.parse(result.toString()),
            });
        });
    }

    private _putListener(): void {
        app.put('/certificate', async (req, res) => {
            const contract = this._network.contract;
            const proposal = req.body as Certificate;
            const certificateStatusBuffer: Buffer = await contract.evaluateTransaction('CertificateExists', proposal.ID);
            const certificateStatus: boolean = 'true' === certificateStatusBuffer.toString();

            if (certificateStatus) {
                await contract.submitTransaction('UpdateCertificate', proposal.ID, proposal.StartDate,
                    proposal.EndDate, proposal.CertNr, proposal.Acquirer, proposal.Address, proposal.RegistrationNr,
                    proposal.State);
                const newCertificateCreated = await contract.evaluateTransaction('CertificateExists', proposal.ID);
                res.json({certificate: proposal, status: newCertificateCreated.toString()});
            } else {
                await contract.submitTransaction('CreateCertificate', proposal.ID, proposal.StartDate,
                    proposal.EndDate, proposal.CertNr, proposal.Acquirer, proposal.Address, proposal.RegistrationNr,
                    proposal.State);
                // Report existence back to backend
                const newCertificateCreated = await contract.evaluateTransaction('CertificateExists', proposal.ID);
                res.json({certificate: proposal, status: newCertificateCreated.toString()});
            }
        });
    }

    private _deleteListener(): void {
        app.delete('/certificate', async (req, res) => {
            await this._network.contract.submitTransaction('DeleteCertificate', req.query.certificate.toString());
            res.json({certificate: req.query.certificate.toString(), status: 200});
        });
    }
}

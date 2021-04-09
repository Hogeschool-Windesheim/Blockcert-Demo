import * as path from 'path';
import {Server} from './server';
import {getArguments, NetworkConfig} from './utils/NetworkConfig';

/**
 * This app is meant to be run by the Certificate Body, it will have the ability to initialize the ledger,
 * and alter it afterwards. Furthermore, it is allowed to lookup certificates from this own registrationNr.
 */
async function main() {
    const networkConfiguration: NetworkConfig = getArguments();
    const server = new Server(path.join(__dirname, networkConfiguration.walletPath));
    server.start(networkConfiguration.portNumber);
}
main();

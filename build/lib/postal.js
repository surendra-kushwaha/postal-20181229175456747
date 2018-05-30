'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _composerClient = require('composer-client');
var _logger = require('../logger');var _logger2 = _interopRequireDefault(_logger);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

const cardname = 'admin@postal';
const workspace = 'com.postal.scm';

class Postal {
  /**
               * Need to have the mapping from bizNetwork name to the URLs to connect to.
               * bizNetwork name will be able to be used by Composer to get the suitable model files.
               *
               */
  constructor() {
    this.bizNetworkConnection = new _composerClient.BusinessNetworkConnection();
  }

  /**
     * @description Initalizes the Postal by making a connection to the Composer runtime
     * @return {Promise} A promise whose fullfillment means the initialization has completed
     */
  async init() {
    _logger2.default.info(
    `Attempting to connect to blockchain network using cardname: ${cardname}`);

    try {
      this.businessNetworkDefinition = await this.bizNetworkConnection.connect(
      cardname);

      _logger2.default.info(
      'Postal:<init>',
      'businessNetworkDefinition obtained',
      this.businessNetworkDefinition.getIdentifier());

      _logger2.default.info('Subscribing to events');
      this.bizNetworkConnection.on('event', evt => {
        _logger2.default.info('New ShipmentPackageEvent', evt);
        // eslint-disable-next-line no-unused-vars
        const options = {
          properties: { key: 'value' } };

      });
    } catch (err) {
      _logger2.default.debug(`Error initializinig business network definition: ${err}`);
    }
  }
  async createPackage(payload) {
    _logger2.default.info('Postal:<createPackage>');
    _logger2.default.debug('Payload received:', payload);
    const factory = this.businessNetworkDefinition.getFactory();

    const packageConcept = factory.newConcept(workspace, 'Package');
    packageConcept.packageId = payload.packageId;
    packageConcept.dispatchId = payload.dispatchId;
    packageConcept.receptacleId = payload.receptacleId;
    packageConcept.weight = payload.weight;
    packageConcept.packageType = payload.packageType;
    packageConcept.shipmentStatus = payload.shipmentStatus;
    packageConcept.lastUpdated = payload.lastUpdated;
    packageConcept.settlementStatus = payload.settlementStatus;

    const originCountry = factory.newRelationship(
    workspace,
    'Postal',
    payload.originCountry);


    const destinationCountry = factory.newRelationship(
    workspace,
    'Postal',
    payload.destinationCountry);


    packageConcept.originCountry = originCountry;
    packageConcept.destinationCountry = destinationCountry;

    _logger2.default.info('Creating Transaction');
    const createPackageTransaction = factory.newTransaction(
    workspace,
    'createPackage');

    createPackageTransaction.package = packageConcept;
    createPackageTransaction.packageUUID = payload.packageUUID;

    _logger2.default.info('Submitting Transaction');
    await this.businessNetworkDefinition.submitTransaction(
    createPackageTransaction);

  }

  async updateShipmentStatus(payload) {
    _logger2.default.info('Postal:<updateShipmentStatus>');
    const factory = this.businessNetworkDefinition.getFactory();
    const updateShipmentTransaction = factory.newTransaction(
    workspace,
    'updateShipmentStatus');

    updateShipmentTransaction.packageIDs = payload.packageIDs;
    updateShipmentTransaction.lastUpdated = payload.lastUpdated;
    updateShipmentTransaction.newShipmentStatus = payload.newShipmentStatus;

    _logger2.default.info(
    `UpdateShipmentTransaction: ${JSON.stringify(
    updateShipmentTransaction,
    null,
    2)
    }`);


    await this.businessNetworkDefinition.submitTransaction(
    updateShipmentTransaction);

  }

  /*  payload: {
                  packageId: packageId,
                  newSettlementStatus: newSettlementStatus
                } */
  async updateSettlementStatus(payload) {
    _logger2.default.info('Postal:<updateSettlementStatus>');
    _logger2.default.debug('Payload received:', payload);
    const factory = this.businessNetworkDefinition.getFactory();

    const packageAsset = factory.newRelationship(
    workspace,
    'PackageAsset',
    payload.packageUUID);

    const updateSettlementTransaction = factory.newTransaction(
    workspace,
    'updateSettlementStatus');

    updateSettlementTransaction.package = packageAsset;
    updateSettlementTransaction.newSettlementStatus =
    payload.newSettlementStatus;

    _logger2.default.info('Submitting Transaction');
    await this.businessNetworkDefinition.submitTransaction(
    updateSettlementTransaction);

  }}


const postal = new Postal();
_logger2.default.info('Initializing postal network controller');
postal.init();exports.default =

postal;
//# sourceMappingURL=postal.js.map

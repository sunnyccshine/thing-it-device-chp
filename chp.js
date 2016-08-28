module.exports = {
    metadata: {
        family: 'chp',
        plugin: 'chp',
        label: 'Generic Combined Heat and Power Unit',
        manufacturer: 'Generic',
        discoverable: false,
        tangible: true,
        additionalSoftware: [],
        actorTypes: [],
        sensorTypes: [],
        state: [{
            id: "power",
            label: "Power",
            type: {
                id: "decimal"
            }
        }, {
            id: "drive",
            label: "Drive",
            type: {
                id: "decimal"
            }
        }, {
            id: "gasConsumption",
            label: "Gas Consumption",
            type: {
                id: "decimal"
            }
        }, {
            id: "heatOutput",
            label: "Heat Output",
            type: {
                id: "decimal"
            }
        }, {
            id: "exhaustTemperature",
            label: "Exhaust Temeperature",
            type: {
                id: "decimal"
            }
        }, {
            id: "coolingWaterTemperature",
            label: "Cooling Water Temperature",
            type: {
                id: "decimal"
            }
        }],
        services: [{
            id: "activate", label: "Activate", parameters: []
        },
            {
                id: "shutdown", label: "Shutdown", parameters: []
            }],
        configuration: []
    },
    create: function () {
        return new Chp();
    },
    discovery: function () {
        return new ChpDiscovery();
    }
};

var q = require('q');
var _ = require('lodash');

function ChpDiscovery() {
    ChpDiscovery.prototype.start = function () {

        if (!this.node.isSimulated()) {
            // TODO For now, need to be able to switch for Discovery or inherit from Device
            this.logLevel = "debug";
            this.scanForCameras();
            this.discoveryInterval = setInterval(this.scanForProbe.bind(this), 30000);
        }
    };

    ChpDiscovery.prototype.stop = function () {
        if (discoveryInterval !== undefined && discoveryInterval) {
            clearInterval(discoveryInterval);
        }
    };

    ChpDiscovery.prototype.scanForProbe = function () {
    };
}

/**
 *
 * @constructor
 */
function Chp() {
    Chp.prototype.start = function () {
        var deferred = q.defer();

        this.state = {};

        if (this.isSimulated()) {
            this.interval = setInterval(function () {
                if (this.state.running) {
                    this.state.power = 400 + 0.1 * new Date().getTime() % 2;
                    this.state.gasConsumption = 134 + new Date().getTime() % 10;
                    this.state.drive = 1500 - 0.1 * new Date().getTime() % 2;
                    this.state.heatOutput = 314 + 5 * new Date().getTime() % 20;
                    this.state.exhaustTemperature = 106 + 0.1 * new Date().getTime() % 2;
                    this.state.coolingWaterTemperature = 88 + 0.1 * new Date().getTime() % 2;
                } else {
                    this.state.power = 0;
                    this.state.gasConsumption = 0;
                    this.state.drive = 0;
                    this.state.heatOutput = 0;
                    this.state.exhaustTemperature = 0;
                    this.state.coolingWaterTemperature = 0;
                }

                this.publishStateChange();
            }.bind(this), 10000);

            this.statusChangeInterval = setInterval(function () {
                if (new Date().getTime() % 2) {
                    this.publishEvent('6.1', {details: 'Lubricant empty'});
                }
            }.bind(this), 20000);

            deferred.resolve();
        } else {

            deferred.resolve();
        }

        return deferred.promise;
    };

    /**
     *
     */
    Chp.prototype.stop = function () {
        var deferred = q.defer();

        if (this.isSimulated()) {
            if (this.interval) {
                clearInterval(this.interval);
            }
            else if (this.statusChangeInterval) {
                clearInterval(this.statusChangeInterval);
            }
        } else {
        }

        deferred.resolve();

        return deferred.promise;
    };

    /**
     *
     */
    Chp.prototype.shutdown = function () {
        this.state.running = false;
        this.state.power = 0;
        this.state.idlePower = 0;

        this.publishStateChange();
    };

    /**
     *
     */
    Chp.prototype.activate = function () {
        this.state.running = true;
        this.state.power = 10 + 0.1 * new Date().getTime() % 2;
        this.state.idlePower = 0.1 * this.state.power;

        this.publishStateChange();
    };

    /**
     *
     */
    Chp.prototype.getState = function () {
        return this.state;
    };

    /**
     *
     */
    Chp.prototype.setState = function () {
    };
}


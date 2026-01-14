module.exports = {
    clear: {},
    bass: {
        equalizer: [
            { band: 0, gain: 0.6 },
            { band: 1, gain: 0.67 },
            { band: 2, gain: 0.67 },
            { band: 3, gain: 0 },
            { band: 4, gain: -0.5 },
            { band: 5, gain: -0.5 },
            { band: 6, gain: -0.5 },
            { band: 7, gain: -0.5 },
            { band: 8, gain: -0.5 },
            { band: 9, gain: -0.5 },
            { band: 10, gain: -0.5 },
            { band: 11, gain: -0.5 },
            { band: 12, gain: -0.5 },
            { band: 13, gain: -0.5 },
        ]
    },
    pop: {
        equalizer: [
            { band: 0, gain: -0.25 },
            { band: 1, gain: 0.48 },
            { band: 2, gain: 0.59 },
            { band: 3, gain: 0.72 },
            { band: 4, gain: 0.56 },
            { band: 5, gain: 0.15 },
            { band: 6, gain: -0.24 },
            { band: 7, gain: -0.24 },
            { band: 8, gain: -0.16 },
            { band: 9, gain: -0.16 },
            { band: 10, gain: 0 },
            { band: 11, gain: 0 },
            { band: 12, gain: 0 },
            { band: 13, gain: 0 },
        ]
    },
    soft: {
        lowPass: { smoothing: 20.0 }
    },
    treblebass: {
        equalizer: [
            { band: 0, gain: 0.6 },
            { band: 1, gain: 0.67 },
            { band: 2, gain: 0.67 },
            { band: 3, gain: 0 },
            { band: 4, gain: -0.5 },
            { band: 5, gain: -0.5 },
            { band: 6, gain: -0.5 },
            { band: 7, gain: -0.45 },
            { band: 8, gain: -0.23 },
            { band: 9, gain: 0.35 },
            { band: 10, gain: 0.45 },
            { band: 11, gain: 0.55 },
            { band: 12, gain: 0.6 },
            { band: 13, gain: 0.5 },
        ]
    },
    nightcore: {
        timescale: {
            speed: 1.1,
            pitch: 1.2,
            rate: 1.0
        }
    },
    vaporwave: {
        timescale: {
            speed: 0.85,
            pitch: 0.8,
            rate: 1.0
        }
    },
    karaoke: {
        karaoke: {
            level: 1.0,
            monoLevel: 1.0,
            filterBand: 220.0,
            filterWidth: 100.0
        }
    },
    tremolo: {
        tremolo: {
            frequency: 2.0,
            depth: 0.5
        }
    },
    eightD: {
        rotation: {
            rotationHz: 0.2
        }
    }
};

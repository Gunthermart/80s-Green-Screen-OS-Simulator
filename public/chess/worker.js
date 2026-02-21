/**
 * Web Worker pour Stockfish
 * Ce fichier doit se trouver dans le même répertoire que index.html
 */

try {
    // Configuration pour charger les fichiers WASM depuis le CDN
    var Module = {
        locateFile: function(path) {
            return 'https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.0/' + path;
        }
    };
    
    // Importation du moteur Stockfish
    importScripts('https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.0/stockfish.js');
    
    // Initialisation selon l'exposition de la librairie
    if (typeof Stockfish === 'function') {
        var engine = Stockfish();
        self.onmessage = function(e) { engine.postMessage(e.data); };
        engine.onmessage = function(msg) { self.postMessage(msg); };
    } else if (typeof STOCKFISH === 'function') {
        var engine = STOCKFISH();
        self.onmessage = function(e) { engine.postMessage(e.data); };
        engine.onmessage = function(msg) { self.postMessage(msg); };
    } else {
        throw new Error("Impossible d'initialiser le moteur Stockfish.");
    }
} catch (e) {
    // Communication de l'erreur fatale au thread principal
    self.postMessage('CRITICAL_ERROR:' + e.message);
}

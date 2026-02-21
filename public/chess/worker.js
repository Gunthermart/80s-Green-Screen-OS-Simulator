
// Résolution du chemin pour le fichier WASM (si requis par la compilation du CDN)
var Module = {
    locateFile: function(path) {
        return 'https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.0/' + path;
    }
};

// Importation du script Stockfish
importScripts('https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.0/stockfish.js');

// Selon la façon dont le script a été packagé, il peut nécessiter une instanciation manuelle
if (typeof Stockfish === 'function') {
    var engine = Stockfish();
    self.onmessage = function(e) { engine.postMessage(e.data); };
    engine.onmessage = function(msg) { self.postMessage(msg); };
} else if (typeof STOCKFISH === 'function') {
    var engine = STOCKFISH();
    self.onmessage = function(e) { engine.postMessage(e.data); };
    engine.onmessage = function(msg) { self.postMessage(msg); };
}
// Si aucune de ces fonctions n'est trouvée, Emscripten a déjà automatiquement
// lié le moteur aux événements self.onmessage et self.postMessage du Worker.

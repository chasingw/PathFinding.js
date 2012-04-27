var Heap       = require('../core/Heap');
var Util       = require('../core/Util');
var Heuristic  = require('../core/Heuristic');

/**
 * Bi-directional A* path-finder.
 * @constructor
 * @param {object} opt
 * @param {boolean}opt.allowDiagonal Whether diagonal movement is allowed.
 * @param {function} opt.heuristic Heuristic function to estimate the distance
 *     (defaults to manhattan).
 */
function BiAStarFinder(opt) {
    opt = opt || {};
    this.allowDiagonal = opt.allowDiagonal;
    this.heuristic = opt.heuristic || Heuristic.manhattan;
};


/**
 * Find and return the the path.
 * @return {Array.<[number, number]>} The path, including both start and 
 *     end positions.
 */
BiAStarFinder.prototype.findPath = function(startX, startY, endX, endY, grid) {
    var heapCmpFunc = function(nodeA, nodeB) {
            return nodeA.f < nodeB.f;
        },
        startNode = grid.getNodeAt(startX, startY),
        endNode = grid.getNodeAt(endX, endY),
        startOpenList = new Heap(heapCmpFunc),
        endOpenList = new Heap(heapCmpFunc),
        heuristic = this.heuristic,
        allowDiagonal = this.allowDiagonal,
        node, neighbors, neighbor, i, l, dx, dy, ng,
        abs = Math.abs, SQRT2 = Math.SQRT2,
        BY_START = 1, BY_END = 2;

    // push the start node into the start open list
    // set the `g` and `f` value of the start node to be 0
    startOpenList.push(startNode);
    startNode.g = 0;
    startNode.f = 0;
    startNode.opened = BY_START;

    // push the start node into the end open list
    // set the `g` and `f` value of the end node to be 0
    endOpenList.push(endNode);
    endOpenList.g = 0;
    endOpenList.f = 0;
    endOpenList.opened = BY_END;

    // while both open lists are not empty
    while (!(startOpenList.isEmpty() ||
             endOpenList.isEmpty())) {

        // expand start open list

        node = startOpenList.pop();
        node.closed = true;

        neighbors = grid.getNeighbors(node, allowDiagonal);
        for (i = 0, l = neighbors.length; i < l; ++i) {
            neighbor = neighbors[i];

            if (neighbor.opened === BY_END) {
                return Util.biBacktrace(neighbor, node);
            }
            
            dx = abs(neighbor.x - node.x);
            dy = abs(neighbor.y - node.y);
            ng = node.g + ((dx === 1 && dy === 1) ? SQRT2 : 1);

            if (neighbor.closed) {
                continue;
            }
            if (!neighbor.opened || ng < neighbor.g) {
                neighbor.g = ng;
                neighbor.h = neighbor.h || heuristic(dx, dy);
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.parent = node;
                if (!neighbor.opened) {
                    startOpenList.push(neighbor);
                    neighbor.opened = BY_START;
                } else {
                    startOpenList.heapify();
                }
            }
        }

        // expand end open list

        node = endOpenList.pop();
        node.closed = true;

        neighbors = grid.getNeighbors(node, allowDiagonal);
        for (i = 0, l = neighbors.length; i < l; ++i) {
            neighbor = neighbors[i];

            if (neighbor.opened === BY_START) {
                return Util.biBacktrace(node, neighbor);
            }
            
            dx = abs(neighbor.x - node.x);
            dy = abs(neighbor.y - node.y);
            ng = node.g + ((dx === 1 && dy === 1) ? SQRT2 : 1);

            if (neighbor.closed) {
                continue;
            }
            if (!neighbor.opened || ng < neighbor.g) {
                neighbor.g = ng;
                neighbor.h = neighbor.h || heuristic(dx, dy);
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.parent = node;
                if (!neighbor.opened) {
                    endOpenList.push(neighbor);
                    neighbor.opened = BY_END;
                } else {
                    endOpenList.heapify();
                }
            }
        }

    }

    // path not found
    return [];
};

module.exports = BiAStarFinder;
$(document).ready(function() {
  "use strict";
  var _current,
      _graph = randomGraph(300, 1200, 5, 0.5),
      _slides = {
        'show-sigma-1': {
          enter: function() {
            var graph = {
              nodes: {
                n1: { label: 'Node 1', x: 0, y: 0, size: 10 },
                n2: { label: 'Node 2', x: 1, y: 1, size: 20 },
                n3: { label: 'Node 3', x: -1, y: -1, size: 30 }
              },
              edges: {
                e1: { source: 'n1', target: 'n2' },
                e2: { source: 'n1', target: 'n3' }
              }
            };

            var k;
            this.inst = sigma.init(
              document.getElementById('sigma-1')
            );

            for (k in graph.nodes)
              this.inst.addNode(k, graph.nodes[k]);

            for (k in graph.edges)
              this.inst.addEdge(
                k,
                graph.edges[k].source,
                graph.edges[k].target,
                graph.edges[k]
              );

            this.inst.draw();
          },
          leave: function() {
            if (this.inst) {
              this.inst.emptyGraph();
              $('#sigma-1').empty();
            }
          }
        },
        'show-sigma-2': {
          enter: function() {
            // Instanciate sigma.js and customize it :
            this.inst = sigma.init(document.getElementById('sigma-2'));

            importGraph(this.inst, _graph);

            // Start the ForceAtlas2 algorithm
            this.inst.startForceAtlas2();
          },
          leave: function() {
            if (this.inst) {
              _graph = exportGraph(this.inst);

              this.inst.stopForceAtlas2();
              this.inst.emptyGraph();
              $('#sigma-2').empty();
            }
          }
        },
        'show-sigma-3': {
          enter: function() {
            // Instanciate sigma.js and customize it :
            var inst = this.inst = sigma.init(document.getElementById('sigma-3'));

            importGraph(this.inst, _graph);

            this.inst.draw();

            // Buttons binding:
            var moveDelay = 80,
                zoomDelay = 2;

            $('.move-icon').bind('click keypress', function(event) {
              var newPos = inst.position();
              switch ($(this).attr('data-action')) {
                case 'up':
                  newPos.stageY += moveDelay;
                  break;
                case 'down':
                  newPos.stageY -= moveDelay;
                  break;
                case 'left':
                  newPos.stageX += moveDelay;
                  break;
                case 'right':
                  newPos.stageX -= moveDelay;
                  break;
              }

              inst.goTo(newPos.stageX, newPos.stageY);

              event.stopPropagation();
              return false;
            });

            $('.zoom-icon').bind('click keypress', function(event) {
              var ratio = inst.position().ratio;
              switch ($(this).attr('data-action')) {
                case 'in':
                  ratio *= zoomDelay;
                  break;
                case 'out':
                  ratio /= zoomDelay;
                  break;
              }

              inst.goTo(
                $('#sigma-3').width() / 2,
                $('#sigma-3').height() / 2,
                ratio
              );

              event.stopPropagation();
              return false;
            });

            $('.refresh-icon').bind('click keypress', function(event) {
              inst.position(0, 0, 1).draw();

              event.stopPropagation();
              return false;
            });
          },
          leave: function() {
            if (this.inst) {
              this.inst.emptyGraph();
              $('#sigma-3').empty();
              $('.move-icon, .zoom-icon, .refresh-icon').unbind('click keypress');
            }
          }
        }
      };

  Reveal.addEventListener('slidechanged', function(e) {
    var i, state;

    for (i in e.currentSlide.attributes) {
      if (e.currentSlide.attributes[i].nodeName === 'data-state') {
        state = e.currentSlide.attributes[i].nodeValue;
        break;
      }
    }

    // Kill last slide:
    if (_current) {
      _slides[_current].leave();
      _current = null;
    }

    // Set current:
    if (state && _slides[state]) {
      _current = state;
      _slides[_current].enter();
    }
  });

  // Export graph:
  function exportGraph(sig) {
    var graph = {
      nodes: [],
      edges: []
    };

    sig.iterNodes(function(node) {
      graph.nodes.push({
        id: node.id,
        x: node.x,
        y: node.y,
        label: node.label,
        size: node.size,
        color: node.color
      });
    });

    sig.iterEdges(function(edge) {
      graph.edges.push({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        weight: edge.weight,
        label: edge.label,
        size: edge.size
      });
    });

    return graph;
  }

  function importGraph(sig, graph) {
    sig.emptyGraph();

    graph.nodes.forEach(function(node) {
      sig.addNode(node.id, {
        x: node.x,
        y: node.y,
        label: node.label,
        size: node.size,
        color: node.color
      });
    });

    graph.edges.forEach(function(edge) {
      sig.addEdge(edge.id, edge.source, edge.target, {
        weight: edge.weight,
        label: edge.label,
        size: edge.size
      });
    });
  }

  // Generate our random graph with :
  //   . N nodes
  //   . E edges
  //   . C clusters
  //   . d the proportion of edges that connect two nodes
  //     from the same cluster
  function randomGraph(N, E, C, d) {
    var i, N, E, C, d,
        clusters = [],
        graph = {
          nodes: [],
          edges: []
        };

    var colors = [
      '#D5C7D4',
      '#D1D882',
      '#89DCBC',
      '#E6BBA0',
      '#E6B875',
      '#C6D7AC',
      '#9ECCE4',
      '#A6E09A',
      '#ECB0C8',
      '#B2DED6'
    ];

    for (i = 0; i < C; i++)
      clusters.push({
        id: i,
        nodes: [],
        color: colors[i]
      });

    for (i = 0; i < N; i++) {
      var cluster = clusters[(Math.random() * C) | 0];
      graph.nodes.push({
        id: i,
        label: i,
        x: Math.random(),
        y: Math.random(),
        size: 0.5 + 4.5 * Math.random(),
        color: cluster.color
      });

      cluster.nodes.push(i);
    }

    for (i = 0; i < E; i++) {
      if (Math.random() < 1 - d) {
        // Random edge
        graph.edges.push({
          id: i,
          source: (Math.random() * N | 0),
          target: (Math.random() * N | 0)
        });
      } else {
        // Intracluster edge
        var cluster = clusters[(Math.random() * C) | 0],
            n = cluster.nodes.length;
        graph.edges.push({
          id: i,
          source: cluster.nodes[Math.random() * n | 0],
          target: cluster.nodes[Math.random() * n | 0]
        });
      }
    }

    return graph;
  }
});

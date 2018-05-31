// CWEtree v0.3
// https://github.com/mh0x/cwetree

(function() {

    var view = document.getElementById('view'),
        button = document.getElementById('toggle'),
        form = document.getElementById('form')
        length = document.getElementById('length'),
        width = document.getElementById('width'),
        cwe_url = 'https://cwe.mitre.org/data/definitions/';

    display();
    controls();

    button.onchange = controls;
    view.onchange = refresh;
    length.onchange = refresh;
    width.onchange = refresh;

    function refresh() {
        window.location.reload(false);
    }

    function controls() {
        if (button.checked) {
            form.style.display = 'block';
        } else {
            form.style.display = 'none';
        }
    }

    function view_tree(id) {
        switch(id) {
            case '699': return view_699;
            case '1000': return view_1000;
            case '1008': return view_1008;
        }
    }

    // Adapted from https://mbostock.github.io/d3/talk/20111018/tree.html
    function display() {

        var m = [20, 160, 20, 160],
            w = window.innerWidth - m[1] - m[3] - 5,
            h = window.innerHeight - m[0] - m[2] - 5,
            i = 0,
            root = view_tree(view.value);

        var tree = d3.layout.tree().size([h, w]);

        var diagonal = d3.svg.diagonal()
            .projection(function(d) {
                return [d.y, d.x];
            });

        var svg = d3.select('main')
            .append('svg:svg')
            .attr('width', w + m[1] + m[3])
            .attr('height', h + m[0] + m[2])

        var vis = svg.append('svg:g')
            .attr('transform', 'translate(' + m[3] + ',' + m[0] + ')');

        root.x0 = h / 2;
        root.y0 = 0;
        root.children.forEach(toggleAll);
        update(root);

        function toggleAll(d) {
            if (d.children) {
                d.children.forEach(toggleAll);
                toggle(d);
            }
        }

        function toggle(d) {
            if (d.children) {
                d._children = d.children;
                d.children = null;
            } else {
                d.children = d._children;
                d._children = null;
            }
        }

        function update(source) {

            var duration = d3.event && d3.event.altKey ? 5000 : 500,
                nodes = tree.nodes(root).reverse(),
                page_w = 0;

            nodes.forEach(function(d) {
                var svg_w = (d.depth+1) * width.value + m[3];
                if (svg_w > page_w) {
                    page_w = svg_w;
                }
                d.y = d.depth * width.value;
            });

            svg.attr('width', page_w);
            vis.attr('width', page_w);

            var node = vis.selectAll('g.node')
                .data(nodes, function(d) {
                    return d.id || (d.id = ++i);
                });

            var nodeEnter = node.enter()
                .append('svg:g')
                .attr('class', 'node')
                .attr('transform', function(d) {
                    return 'translate(' + source.y0 + ',' + source.x0 + ')';
                })
                .on('click', function(d) {
                    toggle(d);
                    update(d);
                })
                .on('dblclick', function(d) {
                    window.open(cwe_url + d.cid + '.html', '_blank');
                });

            nodeEnter.append('svg:circle')
                .attr('r', 1e-6)
                .style('fill', function(d) {
                    return d._children ? 'lightsteelblue' : '#fff';
                });

            nodeEnter.append('svg:text')
               .attr('x', function(d) {
                    return d.children || d._children ? -10 : 10;
                })
                .attr('dy', '.35em')
                .attr('text-anchor', function(d) {
                    return d.children || d._children ? 'end' : 'start';
                })
                .text(function(d) {
                    var name = d.name;
                    if (name.length <= length.value) {
                       return d.name;
                    }
                    return d.name.substr(0, length.value - 3).trim() + '...';
                })
                .style('fill-opacity', 1e-6)
                .append('svg:title')
                .text(function(d) {
                    return d.name + ' [' + d.cid + ']';
                });

            var nodeUpdate = node.transition()
                .duration(duration)
                .attr('transform', function(d) {
                    return 'translate(' + d.y + ',' + d.x + ')';
                });

            nodeUpdate.select('circle')
               .attr('r', 4.5)
               .style('fill', function(d) {
                    return d._children ? 'lightsteelblue' : '#fff';
               });

            nodeUpdate.select('text').style('fill-opacity', 1);

            var nodeExit = node.exit()
                .transition()
                .duration(duration)
                .attr('transform', function(d) {
                    return 'translate(' + source.y + ',' + source.x + ')';
                })
                .remove();

            nodeExit.select('circle').attr('r', 1e-6);
            nodeExit.select('text').style('fill-opacity', 1e-6);

            var link = vis.selectAll('path.link')
                 .data(tree.links(nodes), function(d) {
                     return d.target.id;
                 });

            link.enter()
                .insert('svg:path', 'g')
                .attr('class', 'link')
                .attr('d', function(d) {
                    var o = {x: source.x0, y: source.y0};
                    return diagonal({source: o, target: o});
                })
                .transition()
                .duration(duration)
                .attr('d', diagonal);

            link.transition().duration(duration).attr('d', diagonal);

            link.exit()
                .transition()
                .duration(duration)
                .attr('d', function(d) {
                    var o = {x: source.x, y: source.y};
                    return diagonal({source: o, target: o});
                })
                .remove();

            nodes.forEach(function(d) {
                d.x0 = d.x;
                d.y0 = d.y;
            });

        }

    }

})();

function getGraphData(graph) {
    let adjList = {};

    graph.nodes().forEach(function (node) {
        let id = node.data("id");
        adjList[id] = {};
    });

    graph.edges().forEach( function (edge){
        let source = edge.data("source");
        let target = edge.data("target");
        let weight = parseFloat(edge.data("weight"));
        adjList[source][target] = weight;
        adjList[target][source] = weight;
    });

    return adjList;
}

function runDijkstra( graph, source, target ){
    const graphData = getGraphData(graph);//debug

    console.log("Graph Data:", graphData);
    // 2 dong sau de test nut find shortest path. lam code that thi xoa cai nay di bac a
    const answer = 22;
    const answerPath = "ab -> bc -> ce -> ed";
    //

    return { answer, answerPath };
}

window.runDijkstra = runDijkstra;

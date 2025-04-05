document.addEventListener( "DOMContentLoaded", function (){

    var graph=cytoscape ({
        container: document.getElementById("ctn"),

        elements: [
            { data: {id: "A"} },
            { data: {id: "B"} },
        ],

        wheelSensitivity: 0.1,

        style: [
            { selector: "node",
                style: {
                    "background-color": "#9c4c90", 
                    "text-valign": "center",
                    "color": "white",
                    "text-outline-width": 2,
                    "text-outline-color": "#2F243A",
                    "label": "data(id)",
                    "border-width": 2,
                    "border-color": "#2F243A"
                }
            },
            { selector: "node[main]",
                style: {
                    "background-color": "#bf4e69",
                    "border-width": 4,
                    "border-color": "#382742"
                }
            },
            { selector: "node[targetNode]",
                style: {
                    "background-color": "#F7B61B",
                    "border-width": 4,
                    "border-color": "#382742"
                }
            },
            { selector: "edge",
                style: {
                    "color": "white",
                    "text-outline-width": 3,
                    "text-outline-color": "#3f314d",
                    "width": 2,
                    "line-color": "#70596F",
                    "label": "data(weight)",
                }
            },
            { selector: ":selected",
                style: {
                    "background-color": "#1E90FF",
                    "line-color": "#1E90FF",
                    "target-arrow-color": "#1E90FF",
                    "source-arrow-color": "#1E90FF"
                }
            }
        ],

        layout: {
            name: "grid",
            rows: 1
        }
    });
    
    // Node button
    document.getElementById( "addNode" ).addEventListener( "click", function(){
        var nodeId = prompt( "Enter new node name:" );
      
        if (!nodeId) {
          alert( "You must enter a valid node name!" );
          return;
        }
        if ( graph.getElementById(nodeId).length>0 ){
            alert( "Node name already exists!" );
            return;
        }
      

        graph.add ( {group: "nodes", data: {id: nodeId}} );
      
        graph.layout( {name: "grid"} ).run();
    });      

    // Main node button
    document.getElementById( "mainNode" ).addEventListener( "click", function (){
        var selectedNodes = graph.elements( "node:selected" );

        if ( selectedNodes.length !== 1 ) {
            alert( "Please select a main node!" );
            return;
        }

        graph.nodes().forEach( function (node) {
            node.removeData("main");
        });
      
        selectedNodes[0].data( "main", true );
        graph.style().update();
      
    });

    // Target node button
    document.getElementById("targetNode").addEventListener( "click", function(){
        var selectedNodes = graph.elements( "node:selected" );
    
        if ( selectedNodes.length !== 1 ){
            alert( "Please select a target node!" );
            return;
        }
    
        graph.nodes().forEach( function(node){
            node.removeData("targetNode");
        });
    
        selectedNodes[0].data( "targetNode", true );
        graph.style().update();
    
    });
    
    // Edge button
    document.getElementById( "addEdge" ).addEventListener( "click", function (){
        var sourceId = prompt( "Enter the source node's name:" );
        var targetId = prompt( "Enter the target node's name:" );
        var weight = prompt( "Enter the weight of the edge:" );

        if ( !sourceId || !targetId ){
            alert( "Please enter the source's name, target's name and weight!" );
            return;
        }
        if ( graph.getElementById(sourceId).empty() || graph.getElementById(targetId).empty() ){
            alert("One or both of the nodes do not exist!");
            return;
        }
        if ( isNaN(weight) || weight.trim() === "" || weight <= 0 ){
            alert("Line's weight must be a positive number!")
            return;
        }

        var edgeId = [sourceId, targetId].sort().join("_");

        var exEdge = graph.edges().filter( function (edge){
            var edgeSource = edge.data("source");
            var edgeTarget = edge.data("target");
            var canonID = [edgeSource, edgeTarget].sort().join("_");
            return canonID === edgeId;
        });    

        if ( graph.getElementById(edgeId).length > 0 ){
            alert( "Theres already an edge between these 2 nodes!" );
            return;
        }
      
        graph.add ({
            group: "edges",
            data: { id: edgeId, source: sourceId, target: targetId, weight: weight }
        });
    });
  
    // Delete selected button
    document.getElementById( "deleteSelected" ).addEventListener( "click", function (){
        var selectedEle = graph.elements( ":selected" );

        graph.remove( selectedEle );

        selectedEle.forEach( function (element) {
            if ( element.isEdge() ){
                var sourceId = element.data("source");
                var targetId = element.data("target");
                var edgeId = [sourceId, targetId].sort().join("_");
                var edge = graph.getElementById(edgeId);

                if ( edge.length > 0 ){
                    graph.remove(edge);
                }
            } else {
                graph.remove(element);
            }
        });        
    });

    document.getElementById("runD").addEventListener( "click", function (){
        var mainNodes = graph.nodes().filter( node => node.data("main") );
        var targetNodes = graph.nodes().filter( node => node.data("isTarget") );

        if (mainNodes.length !== 1){
            alert( "Please select main node first!" );
            return;
        }

        var source = mainNodes[0].data("id");
        var target = targetNodes.length ? targetNodes[0].data("id") : null;

        var result = window.runDijkstra( graph, source, target );
        console.log("Dijkstra result:", result);

        var resultWindow = window.open( "", "_blank" );
        resultWindow.document.write(
            "<html>" +
                "<head>" +
                    "<title>Dijkstra Result</title>" +
                    "<style>" +
                        "body { font-family: Arial, sans-serif; background: linear-gradient(to bottom, #2F243A, #454156); margin: 0; padding: 20px; }" + "h1 { color: #2F243A; text-align: center; margin-bottom: 20px; }" + "p { font-size: 16px; color: #333; line-height: 1.5; text-align: center; }" + "strong { color: #bf4e69; }" + ".result-container { background: white; border-radius: 8px; padding: 30px; max-width: 600px; margin: 40px auto; box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1); }" +
                    "</style>" +
                "</head>" +
                "<body>" +
                    "<div class='result-container'>" +
                        "<h1>Dijkstra's Shortest Path Result</h1>" +
                            "<p><strong>Shortest Distance:</strong> " + result.answer + "</p>" +
                            "<p><strong>Path:</strong> " + result.answerPath + "</p>" +
                    "</div>" +
                "</body>" +
            "</html>"
        );
    });
});
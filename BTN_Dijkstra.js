function getGraphData(graph){ // Phần này convert Cytoscape sang danh sách kề
    let adjList = {}; // Khởi tạo đối tượng rỗng để lưu danh sách kề

    // Duyệt qua từng đỉnh trong đồ thị và tạo mục nhập
    graph.nodes().forEach( function (node){
        let id = node.data("id"); // Lấy id của đỉnh hiện tại 
        adjList[id] = {}; // Khởi tạo danh sách các đỉnh kề của đỉnh này làm đối tượng rỗng
    });

    // Duyệt qua từng cạnh trong đồ thị để thêm kết nối giữa các nút
    graph.edges().forEach( function (edge){
        let source = edge.data("source"); // Đỉnh đầu cạnh
        let target = edge.data("target"); // Đỉnh đít cạnh
        let weight = parseFloat(edge.data("weight")); // Độ dài cạnh

        /* Dòng 18 với dòng 19 là để đảm bảo là độ dài 2 cạnh như nhau (VD: AB với BA là như nhau)
        Biết là phần BTN_UI đã có phần đảm bảo cạnh nondirectional r nhưng mà k cho cái này vào là code tính sai :(( */
        adjList[source][target] = weight;
        adjList[target][source] = weight;
    });

    return adjList;
}

function dijkstra( graph, source, target = null ){
    const paths = {};
    var shortest = {}; // Này gần giống array đấy. Tập này lưu khoảng cách ngắn nhất đã biết đến từng nút
    var predecessors = {}; // Tập theo dõi nút cha 
    var visited = new Set(); // Tập theo dõi các nút đã xử lý.
    var queue = []; // Tập hàng đợi cho các nút tiếp theo cần dc xử lý

    //Khởi tạo khoảng cách từ nút cha
    for ( let node in graph ){
        shortest[node] = Infinity; // Khoảng cách tới all nút ban đầu vô hạn
        predecessors[node] = null; // Chưa có nút cha nào
    }

    shortest[source] = 0; // Khoảng cách đến nút bắt đầu là 0
    queue.push( {node: source, distance: 0} ); // Thêm nút bắt đầu vào hàng đợi với khoảng cách 0

    // Xử lý các nút trong hàng đợi ưu tiên.
    while ( queue.length > 0 ){
        queue.sort( (a, b) => a.distance - b.distance ); // Sắp xếp hàng đợi tăng dần
        const current = queue.shift(); // Lấy ra nút có khoảng cách nhỏ nhất
        const currentNode = current.node; // Lấy ID của nút nhỏ nhất
        
        if ( visited.has(currentNode) ){
            continue;
        }
        visited.add(currentNode);
      
          // CHANGED: Early exit if the target is reached.
        if ( target !== null && currentNode === target ){
            break; // Exit the loop as soon as we reach the target.
        }
      
        for (let neighbor in graph[currentNode]) {
            const weight = graph[currentNode][neighbor];
            const newDistance = shortest[currentNode] + weight;

            if ( newDistance < shortest[neighbor] ){
                shortest[neighbor] = newDistance;
                predecessors[neighbor] = currentNode;

                queue.push( {node: neighbor, distance: newDistance} );
            }
        }
      
        if ( visited.has(currentNode) ){ // Bỏ qua nút nếu đã dc xử lý
            continue;
        }

        visited.add(currentNode); // Đánh dấu đã dc xử lý.

        if ( target !== null && currentNode === target ){
            break; // Đến đích thì dừng luôn thuật toán
          }
      
        for ( let neighbor in graph[currentNode] ){ // Xử lý từng nút kề
            const weight = graph[currentNode][neighbor]; // Lấy độ dài cạnh
            const newDistance = shortest[currentNode] + weight; // Tính khoảng cách mới

            // Cập nhật array khoảng cách với nút cha nếu nút mới bé hơn
            if ( newDistance < shortest[neighbor] ){
                shortest[neighbor] = newDistance; // Cập nhật khoảng cách ngắn nhất
                predecessors[neighbor] = currentNode; // Cập nhật nút cha
                queue.push( { node: neighbor, distance: newDistance } ); // Thêm nút kề vào hàng đợi
            }
        }
        
        /* Tìm lại và hiển thị đường đi full (all nút) từ nút bắt đầu đến nút đích sau khi tính khoảng cách. 
        VD là graph đi qua a sang b đến c thì khi tính khoảng cách a -> c nó sẽ trả lại full đường đi abc */
        const paths = {};    
    }
    
    for ( let node in graph ){
        const path = [];
        let current = node;

        while (current){
            path.unshift(current);
            current = predecessors[current];
        }

        if ( path[0] === source ) {
            paths[node] = path;
        } else {
            paths[node] = [];
        }
    }

    return { shortest, predecessors, paths };
}

function runDijkstra( graph, source, target = null ){
    const graphData = getGraphData(graph); // Đổi đồ thị Cytoscape thành danh sách kề
    const result = dijkstra(graphData, source, target); // Dijkstra

    let answer = "";
    let answerPath = "";
    if ( target !== null ){
        answer = result.shortest[target];
        answerPath = result.paths[target].join(" -> ");
    }

    return{
        shortest: result.shortest,
        predecessors: result.predecessors,
        allPaths: result.paths,
        answer: answer,
        answerPath: answerPath
    };

}

window.runDijkstra = runDijkstra; //expose file này để BTN_UI dùng

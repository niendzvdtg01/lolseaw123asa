function getGraphData(graph){ 
    // Hàm này chuyển đồ thị Cytoscape thành danh sách kề (adjacency list)
    let adjList = {}; // Danh sách kề

    // Duyệt qua từng đỉnh trong đồ thị và tạo mục nhập trong danh sách kề
    graph.nodes().forEach( function (node){
        let id = node.data("id"); // ID đỉnh hiện tại
        adjList[id] = {}; // Danh sách các đỉnh kề của đỉnh hiện tại
    });

    // Duyệt qua từng cạnh trong đồ thị để thêm kết nối giữa các đỉnh.
    graph.edges().forEach( function (edge){
        let source = edge.data("source"); // Đỉnh đầu cạnh
        let target = edge.data("target"); // Đỉnh đít cạnh
        let weight = parseFloat(edge.data("weight")); // Độ dài cạnh

        // Đảm bảo danh sách kề là hai chiều (aka đảm bảo là chỉ có 1 đường AB chứ không phải A->B + B->A)
        adjList[source][target] = weight;
        adjList[target][source] = weight;
    });

    return adjList;
}

function dijkstra(graph, source, target = null){
    // Hàm này căn bản là hàm chính để tính thuật toán Dijkstra
    var shortest = {}; // Này là gần giống array đấy. Tập này lưu khoảng cách ngắn nhất đã biết đến từng đỉnh
    var predecessors = {}; // Này theo dõi đỉnh cha của từng đỉnh trong đường đi ngắn nhất
    var visited = new Set(); // Này theo dõi các đỉnh đã dc xử lý
    var queue = []; // Này là hàng đợi ưu tiên cho các đỉnh cần xử lý
    var paths = {}; // Này lưu đường đi đến từng đỉnh

    for (let node in graph){
        shortest[node] = Infinity; // Đặt khoảng cách ban đầu là vô hạn
        predecessors[node] = null; // Đỉnh cha null
    }

    shortest[source] = 0; // Khoảng cách đến đỉnh nguồn là 0
    paths[source] = [source]; // Đường đi đến đỉnh nguồn là đỉnh nguồn (vì distance = 0 đó)
    queue.push({node: source, distance: 0}); // Thêm đỉnh nguồn vào hàng đợi

    // Xử lý các đỉnh trong hàng đợi ưu tiên.
    while (queue.length > 0){
        queue.sort((a, b) => a.distance - b.distance); // Sắp xếp hàng đợi theo khoảng cách tăng dần
        const current = queue.shift(); // Lấy đỉnh có khoảng cách nhỏ nhất ra khỏi hàng đợi
        const currentNode = current.node; // Lấy ID của đỉnh hiện tại

        if (visited.has(currentNode)){ // Bỏ qua đỉnh đã xử lý
            continue;
        }

        visited.add(currentNode); // Đánh dấu đỉnh đã xử lý

        if (target !== null && currentNode === target){ // Dừng nếu đến đỉnh đích
            break;
        }

        // Duyệt qua từng đỉnh kề của đỉnh hiện tại
        for (let neighbor in graph[currentNode]){
            const weight = graph[currentNode][neighbor]; // Lấy độ dài cạnh
            const newDistance = shortest[currentNode] + weight; // Tính khoảng cách mới

            // Mục đích 3 câu sau là cập nhật khoảng cách ngắn nhất và đỉnh cha nếu tìm thấy đường đi ngắn hơn
            if (newDistance < shortest[neighbor]){
                shortest[neighbor] = newDistance; // Khoảng cách min
                predecessors[neighbor] = currentNode; // Đỉnh cha
                queue.push({node: neighbor, distance: newDistance}); // Thêm đỉnh kề vào hàng đợi

                // Cập nhật đường đi đến đỉnh kề
                paths[neighbor] = [...paths[currentNode], neighbor];
            }
        }
    }

    return {shortest, predecessors, paths};
}

function runDijkstra(graph, source, target = null){
    // Hàm này thì chuyển dữ liệu có r để tí đem sang bên BTN_UI để display
    const graphData = getGraphData(graph); // Cytoscape -> danh sách kề
    const result = dijkstra(graphData, source, target); // Chạy thuật toán Dijkstra

    let answer = ""; // Lưu khoảng cách ngắn nhất đến đích
    let answerPath = ""; // Lưu đường đến đích

    if (target !== null && result.paths[target]){ // Nếu có đường đi từ main -> target thì nó chạy cái phần này, không thì nó chạy cái else if 
        answer = result.shortest[target]; // Khoảng cách min đây
        answerPath = result.paths[target].join(" -> "); // Viết đường đi thành dạng A -> B -> C
    } else if (target !== null){
        answer = " No valid length to target! "; 
        answerPath = " No path to target! "; 
    }

    return {
        shortest: result.shortest, 
        predecessors: result.predecessors, 
        allPaths: result.paths, 
        answer: answer, 
        answerPath: answerPath 
    };
}

window.runDijkstra = runDijkstra; // Xuất hàm để bên BTN_UI nó call dc
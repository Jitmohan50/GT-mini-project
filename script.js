let blocks = document.getElementsByClassName("drawing-area")[0];
let addEdge = false;
let cnt = 0;
let dist;

let addNodeMode = false;

const toggleAddNodeMode = () => {
  addNodeMode = !addNodeMode;
  const mapArea = document.querySelector('.drawing-area');
  mapArea.style.pointerEvents = addNodeMode ? 'auto' : 'none'; // Enable or disable interaction with the map based on the mode
};

const addNode = () => {
  toggleAddNodeMode(); // Stop interaction with the map when "Add node" button is clicked
  // Your logic for adding a node goes here
};

// Add an event listener to the "Add node" button
document.getElementById('add-node-toggle').addEventListener('click', addNode);


let alerted = localStorage.getItem("alerted") || "";
if (alerted !== "yes") {
  alert(
    "Read instructions before proceeding by clicking i-icon in the top-right corner"
  );
  localStorage.setItem("alerted", "yes");
}

// It is called when user starts adding edges by clicking on button given
const addEdges = () => {
  if (cnt < 2) {
    alert("Create at least two nodes to add an edge");
    return;
  }

  addEdge = true;
  document.getElementById("add-edge-enable").disabled = true;
  document.querySelector(".run-btn").disabled = false;
  // Initializing array for adjacency matrix representation
  dist = new Array(cnt + 1)
    .fill(Infinity)
    .map(() => new Array(cnt + 1).fill(Infinity));
};

// Temporary array to store clicked elements to make an edge between (max size = 2)
let arr = [];

const appendBlock = (x, y) => {
  document.querySelector(".reset-btn").disabled = false;
  document.querySelector(".click-instruction").style.display = "none";
  // Creating a node
  const block = document.createElement("div");
  block.classList.add("block");
  block.style.top = `${y}px`;
  block.style.left = `${x}px`;
  block.style.transform = `translate(-50%,-50%)`;
  block.id = cnt;

  block.innerText = cnt++;

  // Click event for node
  block.addEventListener("click", (e) => {
    // Prevent node upon node
    e.stopPropagation() || (window.event.cancelBubble = "true");

    // If state variable addEdge is false, can't start adding edges
    if (!addEdge) return;

    block.style.backgroundColor = "coral";
    arr.push(block.id);

    // When two elements are pushed, draw an edge and empty the array
    if (arr.length === 2) {
      drawUsingId(arr);
      arr = [];
    }
  });
  blocks.appendChild(block);
};

// Allow creating nodes on screen by clicking

// Add a click event listener to the document

document.addEventListener('click', function(event) {
  // Check if the click occurred within the drawing area
  if (event.target.closest('.drawing-area')) {
    // Get the position of the click relative to the drawing area
    const rect = event.target.closest('.drawing-area').getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;

    // Create a new node element
    appendBlock(offsetX, offsetY);
  }
});

// Function to draw a line between nodes
const drawLine = (x1, y1, x2, y2, ar) => {
  // prevent multiple edges for the same couple of nodes
  if (dist[Number(ar[0])][Number(ar[1])] !== Infinity) {
    document.getElementById(arr[0]).style.backgroundColor = "#333";
    document.getElementById(arr[1]).style.backgroundColor = "#333";
    return;
  }

  console.log(ar);
  // Length of line
  const len = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
  const slope = x2 - x1 ? (y2 - y1) / (x2 - x1) : y2 > y1 ? 90 : -90;

  // Adding length to distance array
  dist[Number(ar[0])][Number(ar[1])] = Math.round(len / 10);
  dist[Number(ar[1])][Number(ar[0])] = Math.round(len / 10);

  // Drawing line
  const line = document.createElement("div");
  line.id =
    Number(ar[0]) < Number(ar[1])
      ? `line-${ar[0]}-${ar[1]}`
      : `line-${ar[1]}-${ar[0]}`;
  line.classList.add("line");
  line.style.width = `${len}px`;
  line.style.left = `${x1}px`;
  line.style.top = `${y1}px`;

  // Edge weight
  let p = document.createElement("p");
  p.classList.add("edge-weight");
  p.innerText = Math.round(len / 10);
  p.contentEditable = "true";
  p.inputMode = "numeric";
  p.addEventListener("blur", (e) => {
    if (isNaN(Number(e.target.innerText))) {
      alert("Enter valid edge weight");
      return;
    }
    n1 = Number(p.closest(".line").id.split("-")[1]);
    n2 = Number(p.closest(".line").id.split("-")[2]);
    // console.log(p.closest('.line'), e.target.innerText, n1, n2);
    dist[n1][n2] = Number(e.target.innerText);
    dist[n2][n1] = Number(e.target.innerText);
  });
  line.style.transform = `rotate(${
    x1 > x2 ? Math.PI + Math.atan(slope) : Math.atan(slope)
  }rad)`;

  p.style.transform = `rotate(${
    x1 > x2 ? (Math.PI + Math.atan(slope)) * -1 : Math.atan(slope) * -1
  }rad)`;

  line.append(p);
  blocks.appendChild(line);
  document.getElementById(arr[0]).style.backgroundColor = "#333";
  document.getElementById(arr[1]).style.backgroundColor = "#333";
};

// Function to get (x, y) coordinates of clicked node
const drawUsingId = (ar) => {
  if (ar[0] === ar[1]) {
    document.getElementById(arr[0]).style.backgroundColor = "#333";
    arr = [];
    return;
  }
  x1 = Number(document.getElementById(ar[0]).style.left.slice(0, -2));
  y1 = Number(document.getElementById(ar[0]).style.top.slice(0, -2));
  x2 = Number(document.getElementById(ar[1]).style.left.slice(0, -2));
  y2 = Number(document.getElementById(ar[1]).style.top.slice(0, -2));
  drawLine(x1, y1, x2, y2, ar);
};

const findShortestPath = () => {
  const source = parseInt(document.getElementById("source-node").value);
  const destination = parseInt(document.getElementById("destination-node").value);

  if (isNaN(source) || isNaN(destination) || source >= cnt || destination >= cnt) {
    alert("Invalid source or destination node.");
    return;
  }

  const parent = dijkstra(source);
  indicatePath(parent, source, destination);
};

const dijkstra = (source) => {
  const visited = [];
  const unvisited = [];
  const parent = [];
  const cost = [];

  for (let i = 0; i < cnt; i++) {
    parent[i] = -1;
    visited[i] = false;
    unvisited.push(i);
    cost[i] = i === source ? 0 : Infinity;
  }

  while (unvisited.length) {
    const minIndex = unvisited.reduce((minIdx, idx) => cost[idx] < cost[minIdx] ? idx : minIdx, unvisited[0]);
    const minNode = unvisited.splice(unvisited.indexOf(minIndex), 1)[0];
    visited[minNode] = true;

    for (const neighbor of unvisited) {
      const newCost = cost[minNode] + dist[minNode][neighbor];
      if (newCost < cost[neighbor]) {
        cost[neighbor] = newCost;
        parent[neighbor] = minNode;
      }
    }
  }

  return parent;
};

const indicatePath = (parentArr, src, dest) => {
  const path = [];
  let currentNode = dest;

  while (currentNode !== src && currentNode !== -1) {
    path.unshift(currentNode);
    currentNode = parentArr[currentNode];
  }

  if (currentNode === -1) {
    alert("There is no path from the source to the destination.");
    return;
  }

  path.unshift(src);

  document.querySelector(".path").innerHTML = "";
  const p = document.createElement("p");
  p.innerText = "Shortest Path: " + path.join(" -> ");
  document.querySelector(".path").appendChild(p);

  for (let i = 0; i < path.length - 1; i++) {
    const lineId = `line-${Math.min(path[i], path[i + 1])}-${Math.max(path[i], path[i + 1])}`;
    const line = document.getElementById(lineId);
    if (line) {
      line.style.backgroundColor = "aqua";
      line.style.height = "8px";
    }
  }
};


const printPath = async (parent, j, el_p) => {
  if (parent[j] === -1) return;
  await printPath(parent, parent[j], el_p);
  el_p.innerText = el_p.innerText + " " + j;

  document.querySelector(".path").style.padding = "1rem";
  document.querySelector(".path").appendChild(el_p);

  // console.log(j,parent[j]);

  if (j < parent[j]) {
    let tmp = document.getElementById(`line-${j}-${parent[j]}`);
    await colorEdge(tmp);
  } else {
    let tmp = document.getElementById(`line-${parent[j]}-${j}`);
    await colorEdge(tmp);
  }
};

const colorEdge = async (el) => {
  if (el.style.backgroundColor !== "aqua") {
    await wait(1000);
    el.style.backgroundColor = "aqua";
    el.style.height = "8px";
  }
};

const clearScreen = () => {
  document.querySelector(".path").innerHTML = "";
  let lines = document.getElementsByClassName("line");
  for (line of lines) {
    line.style.backgroundColor = "#EEE";
    line.style.height = "5px";
  }
};

const resetDrawingArea = () => {
  blocks.innerHTML = "";

  const p = document.createElement("p");
  p.classList.add("click-instruction");
  p.innerHTML = "Click to create node";

  blocks.appendChild(p);
  document.getElementById("add-edge-enable").disabled = false;
  document.querySelector(".reset-btn").disabled = true;
  document.querySelector(".path").innerHTML = "";

  cnt = 0;
  dist = [];
  addEdge = false;
};

const wait = async (t) => {
  let pr = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("done!");
    }, t);
  });
  res = await pr;
};








     document.addEventListener('DOMContentLoaded', function() {
        const main = document.querySelector('.main');
        const addNodeButton = document.getElementById('add-node');
        const deleteNodeButton = document.getElementById('delete-node');
        const connectNodesButton = document.getElementById('connect-nodes');
        const deselectNodesButton = document.getElementById('deselect-nodes');
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        let connections = []; 
        let selectedNodes = [];
        let nodeIdCounter = parseInt(localStorage.getItem('nodeIdCounter')) || 3;
    
        // Helper to create draggable nodes
            
        function toggleSelectNode(node) {
            if (node.classList.contains('selected')) {
                node.classList.remove('selected');
                selectedNodes = selectedNodes.filter(n => n !== node);
            } else {
                node.classList.add('selected');
                selectedNodes.push(node);
            }
        }

        function makeNodeDraggable(node) {
            const dragPad = document.createElement('div');
            dragPad.className = 'drag-pad';
        
            // Append three dots vertically
            for (let i = 0; i < 3; i++) {
                const dot = document.createElement('div');
                dot.className = 'dot';
                dragPad.appendChild(dot);
            }
        
            node.appendChild(dragPad);
        
            let isDragging = false;
            let origX, origY, mouseX, mouseY;
        
            dragPad.addEventListener('mousedown', (e) => {
                // Prevent other elements from getting this event
                e.stopPropagation();
                
                // Record the initial positions
                origX = node.offsetLeft;
                origY = node.offsetTop;
                mouseX = e.clientX;
                mouseY = e.clientY;
        
                function handleMouseMove(e) {
                    isDragging = true;
                    const deltaX = e.clientX - mouseX;
                    const deltaY = e.clientY - mouseY;
                    node.style.left = `${origX + deltaX}px`;
                    node.style.top = `${origY + deltaY}px`;
                    drawAllLines();
                }
        
                function handleMouseUp(e) {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                    // Trigger selection only if there was no dragging and no ctrl key pressed
                    if (!isDragging && !e.ctrlKey) {
                        toggleSelectNode(node);
                    }
                    isDragging = false;
                }
        
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
            });
        }
    
        // Function to draw lines
        function drawLine(x1, y1, x2, y2) {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
    
        function drawAllLines() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            connections.forEach(conn => {
                const startNode = document.getElementById(conn.startNodeId);  // Get the DOM element by ID
                const endNode = document.getElementById(conn.endNodeId);      // Get the DOM element by ID
        
                if (startNode && endNode) {  // Check if both nodes are found
                    drawLine(
                        startNode.offsetLeft + startNode.offsetWidth / 2, 
                        startNode.offsetTop + startNode.offsetHeight / 2,
                        endNode.offsetLeft + endNode.offsetWidth / 2, 
                        endNode.offsetTop + endNode.offsetHeight / 2
                    );
                }
            });
        }
    
        connectNodesButton.addEventListener('click', () => {
            if (selectedNodes.length === 2) {
                console.log('Connecting:', selectedNodes[0].id, 'to', selectedNodes[1].id); // Log which nodes are being connected
                connections.push({
                    startNodeId: selectedNodes[0].id,
                    endNodeId: selectedNodes[1].id
                });
                drawAllLines();
                selectedNodes.forEach(node => node.classList.remove('selected'));
                selectedNodes = [];
            } else {
                alert('Please select exactly two nodes to connect.');
            }
        });
    
        deleteNodeButton.addEventListener('click', () => {
            const selectedNode = document.querySelector('.node.selected');
            if (selectedNode) {
                // Remove all connections involving the selected node
                connections = connections.filter(conn => 
                    conn.startNode !== selectedNode && conn.endNode !== selectedNode
                );
        
                // Remove the node itself
                selectedNode.remove();
        
                // Update the selectedNodes array
                selectedNodes = selectedNodes.filter(node => node !== selectedNode);
        
                // Redraw lines since we've potentially removed some connections
                drawAllLines();
            }
        });
    
        deselectNodesButton.addEventListener('click', () => {
            if (selectedNodes.length === 2) {
                connections = connections.filter(conn => 
                    !(conn.startNode === selectedNodes[0] && conn.endNode === selectedNodes[1]) &&
                    !(conn.startNode === selectedNodes[1] && conn.endNode === selectedNodes[0])
                );
                drawAllLines();
                selectedNodes.forEach(node => node.classList.remove('selected'));
                selectedNodes = [];
            }
        });
    
        // Apply draggable functionality to initial nodes
        document.querySelectorAll('.node').forEach(makeNodeDraggable);
    
        window.addEventListener('resize', function() {
            canvas.width = main.offsetWidth;
            canvas.height = main.offsetHeight;
            drawAllLines(); // Redraw lines to adjust to new size
        });
    
        document.getElementById('logout').addEventListener('click', function(event) {
            event.preventDefault();
            sessionStorage.removeItem('token');
            window.location.href = '../auth.html'; // Redirect to auth.html after logout
        }); 
                 
    
        // Add event listener to the clear button
        document.getElementById('clearButton').addEventListener('click', () => {
        // Confirmation window to ask the user if they are sure they want to clear the mind map
        const confirmClear = confirm('Are you sure you want to clear the mind map?');
        if (confirmClear) {
            // Clear all nodes and connections
            main.querySelectorAll('.node').forEach(node => node.remove());
            connections = [];
            drawAllLines();
        }
    }); 
    
    
    document.getElementById('saveMindMapButton').addEventListener('click', function() {
        showLoadingIndicator();
        const nodes = document.querySelectorAll('.node');
        const mindMapData = {
          nodes: Array.from(nodes).map(node => ({
            id: node.id,
            content: node.querySelector('p').innerText,
            position: { left: node.style.left, top: node.style.top }
          })),
          connections: connections.map(conn => ({
            startNodeId: conn.startNodeId,
            endNodeId: conn.endNodeId
          }))
        };
        console.log(mindMapData)
        console.log(connections)
      
        const userId = sessionStorage.getItem('userId');
        console.log(userId)
      
        fetch('/mindmaps/saveMindMap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, mindMapData })
        })
        .then(response => response.json())
        .then(data => {
          hideLoadingIndicator();
          alert(data.message)
        })
        .catch(error => {
          hideLoadingIndicator();
          console.error('Error saving mind map:', error);
        });
      });
    
         window.onload = function() {
            const userId = sessionStorage.getItem('userId');
            if (userId) {
              showLoadingIndicator();
              fetch(`/mindmaps/loadMindMap/${userId}`)
                .then(response => response.json())
                .then(data => {
                  hideLoadingIndicator();
                  if (data.mindMapData) {
                    reconstructMindMap(data.mindMapData);
                  }
                })
                .catch(error => {
                  hideLoadingIndicator();
                  console.error('Error loading mind map:', error);
                });
            }
          }; 
          
          function showLoadingIndicator() {
            document.querySelector('.loading-indicator').style.display = 'flex';
          }
          
          function hideLoadingIndicator() {
            document.querySelector('.loading-indicator').style.display = 'none';
          }
    
        function reconstructMindMap(mindMapData) {
            // Clear existing nodes and connections
            main.querySelectorAll('.node').forEach(node => node.remove());
            connections = [];  // Reset connections
    
            // Reconstruct nodes
            mindMapData.nodes.forEach(nodeData => {
                const node = document.createElement('div');
                node.className = 'node';
                node.id = nodeData.id;
                node.style.position = 'absolute';
                node.style.left = nodeData.position.left;
                node.style.top = nodeData.position.top;
                const p = document.createElement('p');
                p.textContent = nodeData.content;
                p.setAttribute('contenteditable', 'true');
                node.appendChild(p);
                main.appendChild(node);
                makeNodeDraggable(node);
            });
    
            connections = mindMapData.connections.map(conn => ({
                startNodeId: conn.startNodeId,
                endNodeId: conn.endNodeId
            }));
    
            drawAllLines();
        }

        addNodeButton.addEventListener('click', () => {
            const newNode = document.createElement('div');
            newNode.className = 'node';
            newNode.id = 'node' + nodeIdCounter; // Ensures each node has a unique ID
            newNode.style.position = 'absolute';
            newNode.style.left = Math.random() * 400 + 'px'; // Random starting position for example
            newNode.style.top = Math.random() * 400 + 'px'; // Random starting position for example
        
            const newNodeContent = document.createElement('p');
            newNodeContent.textContent = 'New Node';
            newNodeContent.setAttribute('contenteditable', 'true');
            newNode.appendChild(newNodeContent);
        
            main.appendChild(newNode);
            makeNodeDraggable(newNode);
            localStorage.setItem('nodeIdCounter', ++nodeIdCounter);
        
            console.log('Created node with ID:', newNode.id); // Logging the ID
        });
    
        document.getElementById('ai-node').addEventListener('click', async () => {
            if (selectedNodes.length > 0) {
              showLoadingIndicator();
              const contents = selectedNodes.map(node => node.querySelector('p').innerText)
              console.log(contents)
              const response = await fetch('/mindmaps/generateAiNode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents })
              });
              const data = await response.json();
              hideLoadingIndicator();
              if (data.suggestedContent) {
                const newNode = document.createElement('div');
                newNode.className = 'node';
                newNode.id = 'node' + nodeIdCounter;
                newNode.style.position = 'absolute';
                newNode.style.left = '50px';    
                newNode.style.top = '50px';   
                const newNodeContent = document.createElement('p');
                newNodeContent.textContent = data.suggestedContent;
                newNodeContent.setAttribute('contenteditable', 'true');
                newNode.appendChild(newNodeContent);
                main.appendChild(newNode);
                makeNodeDraggable(newNode);
                nodeIdCounter++;
              }
            } else {
              alert('Please select at least one node to generate suggestions.');
            }
          });
    
          document.getElementById('clearButton').addEventListener('click', () => {
            // Confirmation window to ask the user if they are sure they want to clear the mind map
            const confirmClear = confirm('Are you sure you want to clear the mind map?');
            if (confirmClear) {
                showLoadingIndicator();
                // Clear all nodes and connections
                main.querySelectorAll('.node').forEach(node => node.remove());
                connections = [];
                drawAllLines();
                hideLoadingIndicator();
            }
        });

          document.getElementById('generate-summary').addEventListener('click', async (e) => {
            e.preventDefault();  // Stop any default behavior
            showLoadingIndicator();  // Show a loading indication to the user
    
            const mindMapData = {
                nodes: Array.from(document.querySelectorAll('.node')).map(node => ({
                    id: node.id,
                    content: node.querySelector('p').innerText,
                })),
                connections: connections.map(conn => ({
                    startNodeId: conn.startNodeId,
                    endNodeId: conn.endNodeId
                })),
            };
    
            try {
                const response = await fetch('/mindmaps/generateSummary', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mindMapData }),
                });
                const data = await response.json();
                if (data && data.summary) {  // Ensure data and summary exist
                    document.getElementById('summaryText').textContent = data.summary;
                    showModal();  // Call to display the modal
                } else {
                    console.error('No summary data received');
                }
            } catch (error) {
                console.error('Error generating summary:', error);
            } finally {
                hideLoadingIndicator();  // Hide loading indicator regardless of success or failure
            }
        });
    
        function showModal() {
            document.getElementById('summaryModal').style.display = 'block';
        }
    
        document.getElementById('closeModal').addEventListener('click', () => {
            document.getElementById('summaryModal').style.display = 'none';
        });
        
        canvas.width = main.offsetWidth;
        canvas.height = main.offsetHeight;
        drawAllLines(); // Ensure all connections are redrawn on initial load
    }); 

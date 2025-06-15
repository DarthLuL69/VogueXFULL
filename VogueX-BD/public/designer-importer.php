<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Importador de Diseñadores</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
            color: #333;
            line-height: 1.6;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            margin-top: 0;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
        }
        .card {
            margin-bottom: 20px;
            background-color: #fff;
            border-radius: 8px;
            padding: 15px 20px;
            box-shadow: 0 1px 5px rgba(0,0,0,0.05);
        }
        .buttons {
            display: flex;
            gap: 10px;
            margin: 20px 0;
        }
        button {
            background-color: #4a5568;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.2s;
        }
        button:hover {
            background-color: #2d3748;
        }
        button.primary {
            background-color: #3182ce;
        }
        button.primary:hover {
            background-color: #2b6cb0;
        }
        pre {
            background-color: #f8f9fa;
            border: 1px solid #edf2f7;
            border-radius: 4px;
            padding: 15px;
            overflow-x: auto;
            margin: 15px 0;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 10px;
            margin: 20px 0;
        }
        .stat-card {
            background-color: #f8fafc;
            border-radius: 6px;
            padding: 15px;
            text-align: center;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #3182ce;
            margin: 5px 0;
        }
        .stat-label {
            font-size: 12px;
            color: #718096;
            text-transform: uppercase;
        }
        .progress-container {
            width: 100%;
            background-color: #edf2f7;
            border-radius: 8px;
            margin: 20px 0;
            overflow: hidden;
        }
        .progress-bar {
            height: 8px;
            background-color: #3182ce;
            width: 0%;
            transition: width 0.3s ease;
        }
        .loading {
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 20px 0;
        }
        .spinner {
            border: 4px solid rgba(0,0,0,0.1);
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border-left-color: #3182ce;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Importador de Diseñadores desde Grailed API</h1>
        
        <div class="card">
            <h2>Estadísticas Actuales</h2>
            <div class="stats" id="stats">
                <div class="stat-card">
                    <div class="stat-value" id="total-designers">--</div>
                    <div class="stat-label">Total Diseñadores</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="popular-designers">--</div>
                    <div class="stat-label">Populares</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="featured-designers">--</div>
                    <div class="stat-label">Destacados</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="images-count">--</div>
                    <div class="stat-label">Con Imágenes</div>
                </div>
            </div>
        </div>

        <div class="card">
            <h2>Importación de Diseñadores</h2>
            <p>Importar al menos 1000 diseñadores desde la API de Grailed. Este proceso puede tardar varios minutos dependiendo de la velocidad de conexión y la disponibilidad de la API.</p>
            
            <div class="buttons">
                <button id="start-import" class="primary">Iniciar Importación</button>
                <button id="check-stats">Actualizar Estadísticas</button>
            </div>
            
            <div class="progress-container">
                <div class="progress-bar" id="progress-bar"></div>
            </div>
            
            <div class="loading" id="loading" style="display: none;">
                <div class="spinner"></div>
            </div>
        </div>
        
        <div class="card">
            <h2>Resultados</h2>
            <pre id="results">Los resultados se mostrarán aquí...</pre>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const startImportBtn = document.getElementById('start-import');
            const checkStatsBtn = document.getElementById('check-stats');
            const resultsContainer = document.getElementById('results');
            const progressBar = document.getElementById('progress-bar');
            const loading = document.getElementById('loading');
            
            // Elementos de estadísticas
            const totalDesigners = document.getElementById('total-designers');
            const popularDesigners = document.getElementById('popular-designers');
            const featuredDesigners = document.getElementById('featured-designers');
            const imagesCount = document.getElementById('images-count');
            
            // Cargar estadísticas iniciales
            fetchStatistics();
            
            // Evento para iniciar importación
            startImportBtn.addEventListener('click', async () => {
                try {
                    loading.style.display = 'flex';
                    startImportBtn.disabled = true;
                    progressBar.style.width = '10%';
                    
                    resultsContainer.textContent = 'Iniciando importación...';
                    
                    const response = await fetch('/api/designers/import', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            quantity: 1000
                        })
                    });
                    
                    progressBar.style.width = '100%';
                    const data = await response.json();
                    
                    resultsContainer.textContent = JSON.stringify(data, null, 2);
                    
                    // Actualizar estadísticas después de la importación
                    fetchStatistics();
                    
                } catch (error) {
                    resultsContainer.textContent = `Error: ${error.message}`;
                } finally {
                    loading.style.display = 'none';
                    startImportBtn.disabled = false;
                }
            });
            
            // Evento para actualizar estadísticas
            checkStatsBtn.addEventListener('click', fetchStatistics);
            
            // Función para obtener estadísticas
            async function fetchStatistics() {
                try {
                    loading.style.display = 'flex';
                    
                    const response = await fetch('/api/designers/statistics');
                    const data = await response.json();
                    
                    if (data.success) {
                        totalDesigners.textContent = data.data.total;
                        popularDesigners.textContent = data.data.popular;
                        featuredDesigners.textContent = data.data.featured;
                        imagesCount.textContent = data.data.with_images;
                    }
                    
                } catch (error) {
                    console.error('Error fetching statistics:', error);
                } finally {
                    loading.style.display = 'none';
                }
            }
        });
    </script>
</body>
</html>

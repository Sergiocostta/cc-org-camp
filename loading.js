diff --git a/frontend/static/css/style.css b/frontend/static/css/style.css
index e0c6af1..e55e9ef 100644
--- a/frontend/static/css/style.css
+++ b/frontend/static/css/style.css
@@ -808,6 +808,50 @@ select.entrada-campo { cursor: pointer; }
     border: 0.5px solid var(--clr-border-hover);
 }
 
+/* =============================================================================
+   OVERLAY DE CARREGAMENTO — exibido durante requisições e ações demoradas
+   ============================================================================= */
+.overlay-carregamento {
+    position: fixed;
+    inset: 0;
+    z-index: 999;
+    display: flex;
+    flex-direction: column;
+    align-items: center;
+    justify-content: center;
+    gap: 14px;
+    background: rgba(248, 247, 244, 0.7);
+    backdrop-filter: blur(2px);
+    -webkit-backdrop-filter: blur(2px);
+    opacity: 0;
+    visibility: hidden;
+    pointer-events: none;
+    transition: opacity var(--dur-normal) var(--ease-out);
+}
+
+[data-theme="dark"] .overlay-carregamento {
+    background: rgba(17, 17, 16, 0.7);
+}
+
+.overlay-carregamento.ativo {
+    opacity: 1;
+    visibility: visible;
+    pointer-events: all;
+}
+
+.spinner-carregamento {
+    width: 32px;
+    height: 32px;
+    border: 2.5px solid var(--clr-border-hover);
+    border-top-color: var(--clr-text-primary);
+    border-radius: 50%;
+    animation: girarSpinner 0.7s linear infinite;
+}
+
+@keyframes girarSpinner {
+    to { transform: rotate(360deg); }
+}
+
 /* =============================================================================
    RESPONSIVO
    ============================================================================= */
diff --git a/frontend/static/js/loading.js b/frontend/static/js/loading.js
new file mode 100644
index 0000000..276b7af
--- /dev/null
+++ b/frontend/static/js/loading.js
@@ -0,0 +1,55 @@
+/* =============================================================================
+   LOADING — overlay de carregamento global
+
+   Injeta um overlay com spinner e o exibe automaticamente em toda chamada
+   fetch() da aplicação (criar campeonato, adicionar participantes, iniciar
+   torneio, atualizar resultados, login, etc.), sem precisar alterar a lógica
+   já existente em cada página. Some sozinho quando a requisição termina ou
+   quando a página acaba de carregar.
+   ============================================================================= */
+
+(function () {
+    function criarOverlay() {
+        const overlay = document.createElement('div')
+        overlay.id = 'overlay-carregamento'
+        overlay.className = 'overlay-carregamento'
+        overlay.setAttribute('role', 'status')
+        overlay.setAttribute('aria-live', 'polite')
+        overlay.innerHTML = `
+            <div class="spinner-carregamento"></div>
+            <span class="sr-only">Carregando...</span>
+        `
+        document.body.appendChild(overlay)
+        return overlay
+    }
+
+    const overlay = criarOverlay()
+    let requisicoesAtivas = 0
+
+    window.mostrarCarregamento = function () {
+        requisicoesAtivas++
+        overlay.classList.add('ativo')
+    }
+
+    window.ocultarCarregamento = function () {
+        requisicoesAtivas = Math.max(0, requisicoesAtivas - 1)
+        if (requisicoesAtivas === 0) {
+            overlay.classList.remove('ativo')
+        }
+    }
+
+    // Segurança extra: garante que o overlay nunca fique "preso" na tela
+    window.addEventListener('load', function () {
+        requisicoesAtivas = 0
+        overlay.classList.remove('ativo')
+    })
+
+    // Intercepta toda chamada fetch() da aplicação para mostrar/ocultar
+    // o loading automaticamente, sem precisar tocar em criar-campeonato.js,
+    // add-competidores.js, chaveamento.js, script.js ou cadastro.js
+    const fetchOriginal = window.fetch
+    window.fetch = function (...args) {
+        window.mostrarCarregamento()
+        return fetchOriginal.apply(this, args).finally(window.ocultarCarregamento)
+    }
+})()
diff --git a/frontend/templates/cadastro.html b/frontend/templates/cadastro.html
index a63a10e..696aebb 100644
--- a/frontend/templates/cadastro.html
+++ b/frontend/templates/cadastro.html
@@ -59,6 +59,7 @@
         </section>
     </main>
     
+<script src="{{ url_for('static', filename='js/loading.js') }}"></script>
 <script src="{{ url_for('static', filename='js/cadastro.js') }}" ></script>
 <script src="{{ url_for('static', filename='js/tema.js') }}"></script>
 </body>
diff --git a/frontend/templates/chaveamento.html b/frontend/templates/chaveamento.html
index 824cd12..9c5f221 100644
--- a/frontend/templates/chaveamento.html
+++ b/frontend/templates/chaveamento.html
@@ -36,6 +36,7 @@
         <div class="chaveamento-container"></div>
 
     </main>
+<script src="{{ url_for('static', filename='js/loading.js') }}"></script>
 <script src="{{ url_for('static', filename='js/chaveamento.js') }}"></script>
 <script src="{{ url_for('static', filename='js/tema.js') }}"></script>
 </body>
diff --git a/frontend/templates/criar-campeonato.html b/frontend/templates/criar-campeonato.html
index ccc6fa4..e9457d6 100644
--- a/frontend/templates/criar-campeonato.html
+++ b/frontend/templates/criar-campeonato.html
@@ -65,6 +65,7 @@
         </section>
     </main>
 
+<script src="{{ url_for('static', filename='js/loading.js') }}"></script>
 <script src="{{ url_for('static', filename='js/criar-campeonato.js') }}"></script>
 <script src="{{ url_for('static', filename='js/tema.js') }}"></script>
 </body>
diff --git a/frontend/templates/home.html b/frontend/templates/home.html
index 7cb62cb..9429b0c 100644
--- a/frontend/templates/home.html
+++ b/frontend/templates/home.html
@@ -41,6 +41,7 @@
         </div>
     </main>
 
+<script src="{{ url_for('static', filename='js/loading.js') }}"></script>
 <script src="{{ url_for('static', filename='js/home.js') }}"></script>
 <script src="{{ url_for('static', filename='js/tema.js') }}"></script>
 </body>
diff --git a/frontend/templates/index.html b/frontend/templates/index.html
index b6a1825..1bbdefa 100644
--- a/frontend/templates/index.html
+++ b/frontend/templates/index.html
@@ -59,6 +59,7 @@
 
     </section>
    </main>
+   <script src="{{ url_for('static', filename='js/loading.js') }}"></script>
    <script src="{{ url_for('static', filename='js/script.js') }}"></script>
    <script src="{{ url_for('static', filename='js/tema.js') }}"></script>
     
diff --git a/frontend/templates/inserir-competidores.html b/frontend/templates/inserir-competidores.html
index 0e8b95f..100677c 100644
--- a/frontend/templates/inserir-competidores.html
+++ b/frontend/templates/inserir-competidores.html
@@ -81,6 +81,7 @@
         </section>
     </main>
     
+<script src="{{ url_for('static', filename='js/loading.js') }}"></script>
 <script src="{{ url_for('static', filename='js/add-competidores.js') }}"></script>
 <script src="{{ url_for('static', filename='js/tema.js') }}"></script>
 </body>

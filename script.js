
document.addEventListener("DOMContentLoaded", function () {

    // MENU RESPONSIVO
    const menuBotao = document.querySelector(".menu-toggle");
    const menu = document.querySelector(".menu");

    if (menuBotao && menu) {
        menuBotao.addEventListener("click", function () {
            menu.classList.toggle("aberto");

            const aberto = menu.classList.contains("aberto");

            menuBotao.setAttribute(
                "aria-expanded",
                aberto.toString()
            );

            menuBotao.textContent = aberto ? "✕" : "☰";
        });
    }

    // CADASTRO DE MONITORAMENTO
    const formulario = document.getElementById("form-monitoramento");
    const lista = document.getElementById("lista-registros");

    const chave = "agrocampo_registros";

    if (formulario && lista) {

        let registros = [];

        try {
            registros = JSON.parse(localStorage.getItem(chave)) || [];
        } catch {
            registros = [];
        }

        function salvarRegistros() {
            localStorage.setItem(chave, JSON.stringify(registros));
        }

        function mostrarRegistros() {

            lista.innerHTML = "";

            if (registros.length === 0) {
                lista.innerHTML =
                    '<p class="texto-vazio">Nenhum registro cadastrado.</p>';
                return;
            }

            registros.forEach(function (registro) {

                const item = document.createElement("article");
                item.className = "registro-item";

                const titulo = document.createElement("h3");
                titulo.textContent = registro.talhao;

                const cultura = document.createElement("p");
                cultura.textContent = "Cultura: " + registro.cultura;

                const situacao = document.createElement("p");
                situacao.textContent = "Situação: " + registro.situacao;

                const descricao = document.createElement("p");
                descricao.textContent = "Observação: " + registro.observacao;

                const data = document.createElement("p");
                data.textContent = "Data: " + registro.data;

                const excluir = document.createElement("button");
                excluir.textContent = "Excluir registro";

                excluir.addEventListener("click", function () {
                    registros = registros.filter(
                        function (r) {
                            return r.id !== registro.id;
                        }
                    );

                    salvarRegistros();
                    mostrarRegistros();
                });

                item.append(
                    titulo,
                    cultura,
                    situacao,
                    descricao,
                    data,
                    excluir
                );

                lista.appendChild(item);
            });
        }

        formulario.addEventListener("submit", function (evento) {

            evento.preventDefault();

            const talhao = document.getElementById("talhao").value.trim();
            const cultura = document.getElementById("cultura").value.trim();
            const situacao = document.getElementById("situacao").value;
            const observacao = document.getElementById("observacao").value.trim();

            if (!talhao || !cultura || !situacao) {
                alert("Preencha os campos obrigatórios.");
                return;
            }

            const novoRegistro = {
                id: Date.now() + Math.random(),
                talhao: talhao,
                cultura: cultura,
                situacao: situacao,
                observacao: observacao || "Sem descrição",
                data: new Date().toLocaleDateString("pt-BR")
            };

            registros.unshift(novoRegistro);

            salvarRegistros();
            mostrarRegistros();

            formulario.reset();

            alert("Registro cadastrado com sucesso!");
        });

        mostrarRegistros();
    }

});

const API_URL = "https://api.tvmaze.com/shows";

let favoritos = JSON.parse(localStorage.getItem("favoritosFuturoPelis")) || [];

let peliculasCargadas = [];



function guardarFavoritos() {
    localStorage.setItem("favoritosFuturoPelis", JSON.stringify(favoritos));
}



function esFavorito(id) {
    return favoritos.some(pelicula => pelicula.id === id);
}



function obtenerPeliculaPorId(id) {
    return peliculasCargadas.find(pelicula => pelicula.id === id)
        || favoritos.find(pelicula => pelicula.id === id);
}



function toggleFavorito(id) {

    const pelicula = obtenerPeliculaPorId(id);

    if (!pelicula) return;

    const existe = favoritos.some(peliculaFavorita => peliculaFavorita.id === id);

    if (existe) {

       
        favoritos = favoritos.filter(peliculaFavorita => peliculaFavorita.id !== id);

    } else {

       
        favoritos.push(pelicula);

    }

    guardarFavoritos();

    
    actualizarBotonesFavoritos();

  
    cargarFavoritos();
}





document.addEventListener("DOMContentLoaded", () => {

    cargarPeliculasAPI();

    cargarFavoritos();

});






async function cargarPeliculasAPI() {

    const gridPeliculas = document.querySelector(".grid-peliculas");
    const gridDestacada = document.querySelector(".grid-destacada");

    if (!gridPeliculas && !gridDestacada) return;

    try {

        const response = await fetch(API_URL);

        const data = await response.json();

        const catalogo = data.slice(0, 50);
        const destacadas = data.slice(50, 54);

        peliculasCargadas = [
            ...catalogo,
            ...destacadas
        ];

        if (gridPeliculas) {

            gridPeliculas.innerHTML = mepearCartasHTML(catalogo);

        }

        if (gridDestacada) {

            gridDestacada.innerHTML = mepearCartasHTML(destacadas);

        }

        inicializarFiltros();

    } catch (error) {

        console.error("Error cargando la API de TVMaze:", error);

    }

}






function mepearCartasHTML(lista) {

    return lista.map(item => {

        const generoPrincipal =
            item.genres && item.genres[0]
                ? item.genres[0].toLowerCase()
                : "todos";


        const imagen =
            item.image
                ? item.image.medium
                : "https://via.placeholder.com/210x295?text=No+Image";


        const resumen =
            item.summary
                ? item.summary
                    .replace(/<[^>]*>/gm, "")
                    .substring(0, 70) + "..."
                : "Sin descripción disponible.";


        
        const favorito = esFavorito(item.id);


        return `
            <div class="card" data-category="${generoPrincipal}">

                <img src="${imagen}" alt="${item.name}">

                <h3>${item.name}</h3>

                <p>${resumen}</p>
            <div class="btn-peliculas" style="display: flex; gap: 15px;">

    <button onclick="window.open('${item.url}', '_blank')">
        Ver Detalles
    </button>

    <button
        class="btn-favorito ${favorito ? "favorito-activo" : ""}"
        data-id="${item.id}"
        onclick="toggleFavorito(${item.id})"
        title="${favorito ? "Quitar de favoritos" : "Agregar a favoritos"}"
    >
        ${favorito ? "❤️" : "🤍"}
    </button>

</div>

            </div>
        `;

    }).join("");

}






function actualizarBotonesFavoritos() {

    const botones = document.querySelectorAll(".btn-favorito");

    botones.forEach(boton => {

        const id = Number(boton.dataset.id);

        if (esFavorito(id)) {

            boton.innerHTML = "❤️";

            boton.classList.add("favorito-activo");

            boton.title = "Quitar de favoritos";

        } else {

            boton.innerHTML = "🤍";

            boton.classList.remove("favorito-activo");

            boton.title = "Agregar a favoritos";

        }

    });

}






function cargarFavoritos() {

    const favoritosGrid = document.getElementById("favoritosGrid");

    if (!favoritosGrid) return;


    if (favoritos.length === 0) {

        favoritosGrid.innerHTML = `
            <p class="sin-favoritos">
                Todavía no tienes películas o series favoritas ❤️
            </p>
        `;

        return;

    }


    favoritosGrid.innerHTML = mepearCartasHTML(favoritos);

}





document.addEventListener("keyup", async (e) => {

    if (e.target.id === "inputBuscar") {

        const textoUsuario = e.target.value.toLowerCase().trim();

        const gridPeliculas = document.querySelector(".grid-peliculas");


        if (textoUsuario.length > 2) {

            try {

                const res = await fetch(
                    `https://api.tvmaze.com/search/shows?q=${textoUsuario}`
                );

                const resultados = await res.json();

                const seriesEncontradas = resultados.map(r => r.show);


                peliculasCargadas = seriesEncontradas;


                if (gridPeliculas && seriesEncontradas.length > 0) {

                    gridPeliculas.innerHTML =
                        mepearCartasHTML(seriesEncontradas);

                    inicializarFiltros();

                }

            } catch (err) {

                console.error("Error en la búsqueda API:", err);

            }


        } else if (textoUsuario.length === 0) {

            cargarPeliculasAPI();


        } else {

            const todasLasCartas =
                document.querySelectorAll(".grid-peliculas .card");


            todasLasCartas.forEach(carta => {

                const tituloH3 = carta.querySelector("h3");

                if (tituloH3) {

                    const nombrePelicula =
                        tituloH3.innerText.toLowerCase();


                    if (nombrePelicula.includes(textoUsuario)) {

                        carta.style.display = "";

                    } else {

                        carta.style.display = "none";

                    }

                }

            });

        }

    }

});




function inicializarFiltros() {

    const filterButtons =
        document.querySelectorAll(".filter-btn");

    const cards =
        document.querySelectorAll(".grid-peliculas .card");


    filterButtons.forEach(button => {

        button.addEventListener("click", () => {

            const filterValue =
                button.getAttribute("data-filter");


            filterButtons.forEach(btn =>
                btn.classList.remove("active")
            );


            button.classList.add("active");


            cards.forEach(card => {

                const category =
                    card.getAttribute("data-category");


                if (
                    filterValue === "all" ||
                    category === filterValue.toLowerCase()
                ) {

                    card.style.display = "";

                } else {

                    card.style.display = "none";

                }

            });

        });

    });

}




function toggleMenu() {

    const sideMenu =
        document.getElementById("mobileMenu") ||
        document.querySelector(".side-menu");

    const overlay =
        document.getElementById("overlay") ||
        document.querySelector(".menu-overlay");


    if (sideMenu) sideMenu.classList.toggle("active");

    if (overlay) overlay.classList.toggle("active");

}


document.querySelectorAll('.side-menu-body a, .menu-content a').forEach(link => {

    link.addEventListener('click', () => {

        toggleMenu();

    });

});




const video = document.getElementById('videoHero');

const soundBtn = document.getElementById('soundBtn');


if (soundBtn && video) {

    const icono = soundBtn.querySelector('i');


    soundBtn.addEventListener('click', () => {

        if (video.muted) {

            video.muted = false;

            video.volume = 1.0;


            video.play().catch(error => {

                console.log(
                    "El navegador bloqueó el audio: ",
                    error
                );

            });


            if (icono) {

                icono.classList.replace(
                    'fa-volume-mute',
                    'fa-volume-up'
                );

            }

        } else {

            video.muted = true;


            if (icono) {

                icono.classList.replace(
                    'fa-volume-up',
                    'fa-volume-mute'
                );

            }

        }

    });

}
/* 
declarando constante COVID que contendrá el resumen general de contagiados
y fallecidos
*/
COVID = []
// variable que albergará el país seleccionado del mapa
sumary = [
    { group: "Contagiados", value: 1 },
    { group: "Fallecidos", value: 1 }
]
// leyendo archivo CSV y cargando su contenido al array COVID
d3.csv("WHO-COVID-19-summary.csv").then((res) => {
    res.forEach(element => {
        COVID.push(element)
    });
})

// Definiendo parámetros de ancho y alto para del SVG del mapa
const svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

// Realizando la proyección y el escalado
const path = d3.geoPath();
const projection = d3.geoMercator()
    .scale(115)
    .center([0, 20])
    .translate([width / 2, height / 2]);

// Definiendo la escala de colores para el mapa
// La escala de color responde a la cantidad de contagiados por país
const data = new Map();
const colorScale = d3.scaleThreshold()
    .domain([100000, 500000, 1000000, 5000000, 10000000, 25000000, 50000000])
    .range(d3.schemeReds[5]);

//*****************Begin: Legenda del Mapa *******************/    
const legendWidth = Math.min(width * 0.50, 400);
// Asignando el svg para la escala de datos
const svg_legend = svg.append("g")
    .attr("class", "legendWrapper")
    .attr("transform",
        "translate(" + (width * 0.73) + "," + (16) + ")");

//*****************End:  Legenda del Mapa *******************/


//*****************BAR PLOT*******************/
// definiendo margenes y ancho y largo del barplot
const margin = {
    top: 30,
    right: 30,
    bottom: 70,
    left: 60
},
    width_bp = 460 - margin.left - margin.right,
    height_bp = 400 - margin.top - margin.bottom;

// Asignando el svg para el barplot sobre el div #barplot
const svg_bp = d3.select("#my_barplot")
    //    .append("svg")
    .attr("width", width_bp + margin.left + margin.right)
    .attr("height", height_bp + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        `translate(${margin.left},${margin.top})`);


// Inicializando valores para el eje X
const x = d3.scaleBand()
    .range([0, width_bp])
    .padding(0.2);
const xAxis = svg_bp.append("g")
    .attr("transform", `translate(0,${height_bp})`)


// Inicializando valores para el eje Y
const y = d3.scaleLinear()
    .range([height_bp, 0]);
const yAxis = svg_bp.append("g")
    .attr("class", "myYaxis")

//*****************BAR PLOT*******************/


// Cargando información externa
Promise.all([
    //Obteniendo todos las coordenadas del póligo para cada país del mundo
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
    //Obteniendo el resumen de reportes y fallecidos por país
    d3.csv("WHO-COVID-19-summary.csv", function (d) {
        data.set(d.Country_code, +d.New_cases)
    })]).then(function (loadData) {
        let topo = loadData[0]

        let mouseOver = function (d) {
            d3.selectAll(".Country")
                .transition()
                .duration(200)
                .style("opacity", .5)
            d3.select(this)
                .transition()
                .duration(200)
                .style("opacity", 1)
                .style("stroke", "black")
        }

        let mouseLeave = function (d) {
            d3.selectAll(".Country")
                .transition()
                .duration(200)
                .style("opacity", .8)
            d3.select(this)
                .transition()
                .duration(200)
                .style("stroke", "transparent")
        }

        // Dibujando el mapa
        svg.append("g")
            .selectAll("path")
            .data(topo.features)
            .enter()
            .append("path")
            // Dibujando cada país
            .attr("d", d3.geoPath()
                .projection(projection)
            )
            // Asignando color a cada país
            .attr("fill", function (d) {
                d.total = data.get(d.id) || 0;
                return colorScale(d.total);
            })
            .style("stroke", "transparent")
            .attr("class", function (d) { return "Country" })
            .style("opacity", .8)
            //Asignando evento cuando el puntero del mouse está sobre el área cada polígono del país
            .on("mouseover", mouseOver)
            //Asignando evento cuando el puntero se retira del área del polígono del país
            .on("mouseleave", mouseLeave)
            //Cuando el usuario proporciona click sobre el polígono se redibuja el barplot
            .on("click", function (d, i) {
                drawBarplot(i.id);
                drawLegendPointer(i.id);
            })

        // Dibuja la legenda del Mapa
        drawMapLegend();
    })

function drawBarplot(i) {
    //Se busca la información relacionda con el país selecciondo
    //dentro del array inicial COVID
    let res = COVID.find(pais => pais.Country_code === i)
    //Limpia el array
    sumary = []
    //Asignando los elementos encontrados en la búsqueda
    //al array sumary
    sumary.push(
        {
            'group': 'Contagiados',
            'value': res.New_cases
        },
        {
            'group': 'Fallecidos',
            'value': res.New_deaths
        }
    )

    // Actualizando el eje x en función del país seleccionado
    x.domain(sumary.map(d => d.group))
    xAxis.call(d3.axisBottom(x))

    // Actualizando el eje y en función del país seleccionado
    // reescalando el eje dependiendo de la cantidad de personas contagiadas
    var contagiados = parseInt(sumary[0].value, 10)
    if (contagiados <= 100000) {
        max = 100000
    } else if (contagiados > 100000 && contagiados <= 500000) {
        max = 500000
    } else if (contagiados > 500000 && contagiados <= 1000000) {
        max = 1000000
    } else if (contagiados > 1000000 && contagiados <= 5000000) {
        max = 5000000
    } else if (contagiados > 5000000 && contagiados <= 10000000) {
        max = 10000000
    } else if (contagiados > 10000000 && contagiados <= 25000000) {
        max = 25000000
    } else if (contagiados > 25000000 && contagiados <= 50000000) {
        max = 50000000
    }
    y.domain([0, max]);
    // Asignando animación
    yAxis.transition().duration(1000).call(d3.axisLeft(y));

    var u = svg_bp.selectAll("rect")
        .data(sumary)
    //Dibujando las barras y asignando animaciones de transición
    u.join("rect")
        .transition()
        .duration(1000)
        .attr("x", d => x(d.group))
        .attr("y", d => y(d.value))
        .attr("width", x.bandwidth())
        .attr("height", d => height_bp - y(d.value))
        .attr("fill", "rgb(223, 163, 0, 0.863)")

    //Asignando dinámicamente el título del gráfico    
    d3.select("#barplotTitle")
        .text(res.Country)
        .attr("class", "legendTitle")

    //Asignando dinámicamente el resumen del país
    d3.select("#contagiados")
        .text(parseInt(res.New_cases).toLocaleString('es-MX'))
    d3.select("#fallecidos")
        .text(parseInt(res.New_deaths).toLocaleString('es-MX'))
}

// Función encargada de dibujar la legenda del mapa
function drawMapLegend() {
    /* -- Definición del gradiente de forma lineal -- */
    var def_lg = svg.append("defs")
        .append("linearGradient")
        .attr("id", "def_linear_gradient")
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "100%").attr("y2", "0%");
    // Color de finalización del gradiente
    def_lg.append("stop")
        .attr("offset", "0%")
        .style("stop-color", d3.max(colorScale.range()))
        .style("stop-opacity", 1)
    // Color de inicio del gradiente
    def_lg.append("stop")
        .attr("offset", "100%")
        .style("stop-color", d3.min(colorScale.range()))
        .style("stop-opacity", 1)
    /* -- */

    /* -- Dibujando el rectángulo -- */
    svg_legend.append("rect")
        .attr("class", "legendRect")
        .attr("x", -legendWidth / 2)
        .attr("y", 0)
        .attr("width", legendWidth)
        .attr("height", 5)
        .style("fill", "url(#def_linear_gradient)");
    /* -- */

    /* -- Título de la leyenda -- */
    svg_legend.append("text")
        .attr("class", "legendTitle")
        .attr("x", 0)
        .attr("y", -5)
        .style("text-anchor", "middle")
        .text("03/01/2020 al 29/11/2021");
    /* -- */

    /* -- Leyenda de la escala de los datos -- */
    // Escala para cantidades
    var Leg_xScale = d3.scaleLinear()
        .domain([0, 50000000])
        .range([-legendWidth / 2, legendWidth / 2])
    // Axis para dar formato a los datos (abreviación de Millones)
    var Leg_xAxis = d3.axisBottom(Leg_xScale).tickFormat(function (d) {
        return d / 1000000 + "MM";
    })

    //Configura el eje X
    svg_legend.append("g")
        .attr("class", "legendAxis")
        .attr("transform", "translate(0," + (5) + ")")
        .call(Leg_xAxis);
    /* -- */
}

// Función drawLegendPointer: dibuja sobre la escala de color
// un puntero con la cantidad de casos para una rápida identificación.
function drawLegendPointer(i) {
    // Filtra los datos específicos del país seleccionado
    let res = COVID.find(pais => pais.Country_code === i);
    // El valor a representar en el apuntados, es la suma de los nuevos casos
    var value = parseInt(res.New_cases) + parseInt(res.New_deaths);

    /* -- Leyenda de la escala de los datos -- */
    var PtScale = d3.scaleLinear()
        .range([-legendWidth / 2, legendWidth / 2])
        .domain([0, 50000000]);
    // Definición del objeto apuntador (Diamante)
    var symb = d3.symbol().type(d3.symbolDiamond).size(30);
    // Dibuja el apuntador 
    svg_legend.selectAll("path")
        .attr("d", symb)
        .attr("fill", "black")
        .attr("transform", "translate(" + PtScale(value) + ", -2)");
}

function showTitleBarPlot(res) {

}
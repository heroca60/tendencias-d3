composición general del proyecto:
index.html
resources:
    -> main.css
    -> main.js
limpiezaCodigosPais.ipynb
README.txt
WHO-COVID-19-global-data.csv -> recuperado de https://covid19.who.int/
WHO-COVID-19-global-data-alpha3.csv
WHO-COVID-19-global-summary.csv

----------------------------------------------------------------

"EL DATASET CUENTA CON REGISTROS DEL: 03/01/2020 AL 29/11/2021"

----------------------------------------------------------------

La actividad está desarrollada con la "d3.v6"

----------------------------------------------------------------

Visualización #1
Mapa: contiene la escala de colores ROJOS referentes a la cantidad
de contagiados por país, la intensidad del rojo indica mayor cantidad
de contagios.
Escala actual:
[100000, 500000, 1000000, 5000000, 10000000, 25000000, 50000000]

Visualización #2
BarPlot: desplagará la cantidad de contagiados y fallecidos cuando
el usuario proporcione un click sobre un país, la visualización 
es dinámica en términos del eje Y y las barras.
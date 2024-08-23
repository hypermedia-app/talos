PREFIX cube: <https://cube.link/>

INSERT {
  GRAPH </lindas-cubes> {
    ?s a cube:Cube
  }
} WHERE {
  SERVICE <https://test.lindas.admin.ch/query> {
    ?s a cube:Cube
  }
}

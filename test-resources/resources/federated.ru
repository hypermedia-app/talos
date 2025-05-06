PREFIX cube: <https://cube.link/>

INSERT {
  GRAPH </lindas-cubes> {
    ?s a cube:Cube
  }
} WHERE {
  SERVICE <https://test.lindas.admin.ch/x-query> {
    ?s a cube:Cube
  }
};

INSERT {
  GRAPH </also-cubes> {
    ?s a cube:Cube
  }
} WHERE {
  SERVICE <urn:endpoint:lindas> {
    ?s a cube:Cube
  }
}

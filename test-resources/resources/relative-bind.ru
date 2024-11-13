INSERT {
    GRAPH ?s {
      ?s a ?o .
    }
} WHERE {
  BIND ( <subject> AS ?s )            # bind path relative to /relative-bind/
  BIND ( </api/schema/Person> AS ?o ) # bind absolute path
}

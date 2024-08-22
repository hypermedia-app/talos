PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX schema: <http://schema.org/>

INSERT {
  GRAPH ?g {
    ?s a schema:Person .
  }
}
WHERE {
  GRAPH ?g {
    ?s a foaf:Person .
  }
}
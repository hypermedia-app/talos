PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX schema: <http://schema.org/>

INSERT DATA {
  GRAPH <john-doe> {
    <john-doe> schema:givenName "John" .
  }
}

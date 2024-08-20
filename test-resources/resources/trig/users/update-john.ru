PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX schema: <http://schema.org/>

INSERT DATA {
  GRAPH <john-doe> {
    <john-doe> schema:givenName "John" .
  }
}
;

INSERT {
  GRAPH <john-doe-additional> {
    <john-doe> schema:givenName ?name .
  }
}
WHERE {
  GRAPH <john-doe> {
    <john-doe> schema:givenName ?name .
  }
}
;

INSERT {
  GRAPH <john-doe-additional> {
    <john-doe> a ?type 
  }
}
WHERE {
  GRAPH <john-doe> {
    <john-doe> a ?type .
  }
}
# Developers

This manual is for developers who want to interact with the Paired Omics Data Platform in a programmatic manner.

How to contribute as a developer to the platform is described in [../CONTRIBUTING.md](../CONTRIBUTING.md).

## Web service

To consume the [web service](http://pairedomicsdata.bioinformatics.nl/api) some examples are provided and a specification.

### Examples

Using [httpie](https://httpie.org) as a http client.

```bash
# Install httpie
pip install httpie
# Submit a project
http -j pairedomicsdata.bioinformatics.nl/api/projects < ../app/public/examples/paired_datarecord_MSV000078839_example.json
# List pending projects
http pairedomicsdata.bioinformatics.nl/api/pending/projects 'Authorization: Bearer ashdfjhasdlkjfhalksdjhflak'
# Approve pending projects
http POST pairedomicsdata.bioinformatics.nl/api/pending/projects/a6f87bdf-6998-4336-8fb1-eca5b4fdb882.1 'Authorization: Bearer ashdfjhasdlkjfhalksdjhflak'
# List summary of projects
http pairedomicsdata.bioinformatics.nl/api/projects
# Get single project
http pairedomicsdata.bioinformatics.nl/api/projects/a6f87bdf-6998-4336-8fb1-eca5b4fdb882.1
# Get stats
http pairedomicsdata.bioinformatics.nl/api/stats
```

Change `a6f87bdf-6998-4336-8fb1-eca5b4fdb882.1` project id to what previous requests return.
Change `ashdfjhasdlkjfhalksdjhflak` token to what you got as an authentication token.

### OpenAPI specification

The web services ships with an [OpenAPI specification](https://www.openapis.org/).
The specification is available at [http://pairedomicsdata.bioinformatics.nl/openapi.yaml](http://pairedomicsdata.bioinformatics.nl/openapi.yaml).

To try out the specification you can use the [Swagger UI](https://swagger.io/tools/swagger-ui/) at [/api/ui/?url=/openapi.yaml](/api/ui/?url=/openapi.yaml)

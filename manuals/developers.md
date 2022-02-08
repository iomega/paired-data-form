# Developers

This manual is for developers who want to interact with the Paired Omics Data Platform in a programmatic manner.

How to contribute as a developer to the platform is described in [../CONTRIBUTING.md](../CONTRIBUTING.md).

## Web service

To consume the [web service](https://pairedomicsdata.bioinformatics.nl/api) some examples are provided and a specification.

### Examples

Using [httpie](https://httpie.org) as a http client.

```bash
# Install httpie
pip install httpie
# Submit a project
https -j pairedomicsdata.bioinformatics.nl/api/projects < ../app/public/examples/paired_datarecord_MSV000078839_example.json
# List pending projects
https pairedomicsdata.bioinformatics.nl/api/pending/projects 'Authorization: Bearer ashdfjhasdlkjfhalksdjhflak'
# Approve pending projects
https POST pairedomicsdata.bioinformatics.nl/api/pending/projects/a6f87bdf-6998-4336-8fb1-eca5b4fdb882.1 'Authorization: Bearer ashdfjhasdlkjfhalksdjhflak'
# List summary of projects
https pairedomicsdata.bioinformatics.nl/api/projects
# Get single project
https pairedomicsdata.bioinformatics.nl/api/projects/a6f87bdf-6998-4336-8fb1-eca5b4fdb882.1
# Get stats
https pairedomicsdata.bioinformatics.nl/api/stats
```

Change `a6f87bdf-6998-4336-8fb1-eca5b4fdb882.1` project id to what previous requests return.
Change `ashdfjhasdlkjfhalksdjhflak` token to what you got as an authentication token.

### OpenAPI specification

The web services ships with an [OpenAPI specification](https://www.openapis.org/).
The specification is available at [https://pairedomicsdata.bioinformatics.nl/openapi.yaml](https://pairedomicsdata.bioinformatics.nl/openapi.yaml).

To try out the specification you can use the [Swagger UI](https://swagger.io/tools/swagger-ui/) at [/api/ui/](https://pairedomicsdata.bioinformatics.nl/api/ui). When trying out a local deployment don't forget to pick the right server in the Swagger UI.

jest.mock('node-fetch');

import fetch from 'node-fetch';
const { Response } = jest.requireActual('node-fetch');

import { enrich, parse_JGITaxonDetail_page } from './enrich';
import { IOMEGAPairedDataPlatform } from './schema';

describe('enrich()', () => {
    describe('Genome with genbank accession', () => {
        let project: IOMEGAPairedDataPlatform;
        beforeEach(() => {
            project = {
                version: '1',
                personal: {},
                genomes: [{
                    'genome_ID': {
                        'genome_type': 'genome',
                        'GenBank_accession': 'ARJI01000000'
                    },
                    'genome_label': 'Streptomyces sp. CNB091'
                }],
                metabolomics: {
                    project: {
                        GNPSMassIVE_ID: 'MSV000078839',
                        MaSSIVE_URL: 'https://massive.ucsd.edu/ProteoSAFe/dataset.jsp?task=a507232a787243a5afd69a6c6fa1e508'
                    }
                },
                experimental: {},
                genome_metabolome_links: []
            };
            ((fetch as any) as jest.Mock).mockImplementation((url) => {
                if (url === 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=nuccore&id=ARJI01000000&retmode=json') {
                    const resp = {
                        'header': {
                            'type': 'esummary',
                            'version': '0.3'
                        },
                        'result': {
                            'uids': [
                                '481754485'
                            ],
                            '481754485': {
                                'uid': '481754485',
                                'caption': 'ARJI00000000',
                                'title': 'Streptomyces sp. CNB091, whole genome shotgun sequencing project',
                                'extra': 'gi|481754485|gb|ARJI00000000.1|ARJI01000000',
                                'gi': 481754485,
                                'createdate': '2013/04/22',
                                'updatedate': '2013/12/12',
                                'flags': '',
                                'taxid': 1169156,
                                'slen': 57,
                                'biomol': 'genomic',
                                'moltype': 'dna',
                                'topology': 'linear',
                                'sourcedb': 'insd',
                                'segsetsize': '',
                                'projectid': '178488',
                                'genome': '',
                                'subtype': 'strain',
                                'subname': 'CNB091',
                                'assemblygi': '',
                                'assemblyacc': '',
                                'tech': 'wgs',
                                'completeness': '',
                                'geneticcode': '11',
                                'strand': '',
                                'organism': 'Streptomyces sp. CNB091',
                                'strain': 'CNB091',
                                'biosample': 'SAMN02441673',
                                'statistics': [
                                    {
                                        'type': 'all',
                                        'count': 1
                                    },
                                    {
                                        'type': 'blob_size',
                                        'count': 4394
                                    },
                                    {
                                        'type': 'org',
                                        'count': 1
                                    },
                                    {
                                        'type': 'pub',
                                        'count': 1
                                    },
                                    {
                                        'source': 'all',
                                        'type': 'all',
                                        'count': 1
                                    },
                                    {
                                        'source': 'all',
                                        'type': 'blob_size',
                                        'count': 4394
                                    },
                                    {
                                        'source': 'all',
                                        'type': 'org',
                                        'count': 1
                                    },
                                    {
                                        'source': 'all',
                                        'type': 'pub',
                                        'count': 1
                                    }
                                ],
                                'properties': {
                                    'na': '1',
                                    'master': '1',
                                    'value': '1'
                                },
                                'oslt': {
                                    'indexed': true,
                                    'value': 'ARJI00000000.1'
                                },
                                'accessionversion': 'ARJI00000000.1'
                            }
                        }
                    };
                    return Promise.resolve(new Response(JSON.stringify(resp)));
                }
                return Promise.reject(new Error('URL not mocked'));
            });
        });

        it('should have enriched genome', async () => {
            expect.assertions(1);

            const enrichment = await enrich(project);

            const enriched_genome = enrichment.genomes['Streptomyces sp. CNB091'];
            const expected = {
                'species': {
                    'scientific_name': 'Streptomyces sp. CNB091',
                    'tax_id': 1169156
                },
                'title': 'Streptomyces sp. CNB091, whole genome shotgun sequencing project',
                'url': 'https://www.ncbi.nlm.nih.gov/nuccore/ARJI01000000'
            };
            expect(enriched_genome).toEqual(expected);
        });
    });

    describe('Genome with bogus genbank accession', () => {
        let project: IOMEGAPairedDataPlatform;
        beforeEach(() => {
            project = {
                version: '1',
                personal: {},
                genomes: [{
                    'genome_ID': {
                        'genome_type': 'genome',
                        'GenBank_accession': 'IAMNOTCORRECT'
                    },
                    'genome_label': 'Some label'
                }],
                metabolomics: {
                    project: {
                        GNPSMassIVE_ID: 'MSV000078839',
                        MaSSIVE_URL: 'https://massive.ucsd.edu/ProteoSAFe/dataset.jsp?task=a507232a787243a5afd69a6c6fa1e508'
                    }
                },
                experimental: {},
                genome_metabolome_links: []
            };
            ((fetch as any) as jest.Mock).mockImplementation((url) => {
                if (url === 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=nuccore&id=IAMNOTCORRECT&retmode=json') {
                    const resp: any = {
                        'header': {
                            'type': 'esummary',
                            'version': '0.3'
                        },
                        'error': 'Invalid uid IAMNOTCORRECT at position=0',
                        'result': {
                            'uids': [
                            ]
                        }
                    };
                    return Promise.resolve(new Response(JSON.stringify(resp)));
                }
                return Promise.reject(new Error('URL not mocked'));
            });
        });

        it('should have non enriched genome', async () => {
            expect.assertions(1);

            const enrichment = await enrich(project);
            expect(enrichment.genomes).toEqual({});
        });
    });

});

function sample_JGI_genome_page() {
    // Download on 25-02-2020 of https://img.jgi.doe.gov/cgi-bin/m/main.cgi?section=TaxonDetail&page=taxonDetail&taxon_oid=2724679019
    /* tslint:disable:no-trailing-whitespace */
    return `<!DOCTYPE html>
    
    <html>
    <head>
    
    <title>IMG</title>
    
    <meta charset="UTF-8">
    <meta name="description" content="Integrated Microbial Genomes" />
    <meta name="keywords" content="gene,genome,metagenome,microbe,microbial,img,jgi, virus" />
    
    
    
    <!--  -->
    <link rel="stylesheet" type="text/css" href="https://img.jgi.doe.gov/css/jgi.css" />
    <link rel="stylesheet" type="text/css" href="https://img.jgi.doe.gov/css/div-v33.css" />
    <link rel="stylesheet" type="text/css" href="https://img.jgi.doe.gov/css/menu-abc.css" />
    <link rel="stylesheet" type="text/css" href="https://img.jgi.doe.gov/css/img-v33.css" />
    <link rel="icon" href="https://img.jgi.doe.gov/images/favicon.ico"/>
    <link rel="SHORTCUT ICON" href="https://img.jgi.doe.gov/images/favicon.ico" />
    
    <!-- Individual YUI CSS files -->
    <link rel="stylesheet" type="text/css" href="/../yui282/yui/build/autocomplete/assets/skins/sam/autocomplete.css" />
    <link rel="stylesheet" type="text/css" href="/../yui282/yui/build/paginator/assets/skins/sam/paginator.css">
    <link rel="stylesheet" type="text/css" href="/../yui282/yui/build/datatable/assets/skins/sam/datatable.css">
    <link rel="stylesheet" type="text/css" href="/../yui282/yui/build/container/assets/skins/sam/container.css" />
    <link rel="stylesheet" type="text/css" href="/../yui282/yui/build/progressbar/assets/skins/sam/progressbar.css">
    <link rel="stylesheet" type="text/css" href="/../yui282/yui/build/button/assets/skins/sam/button.css" />
    <link rel="stylesheet" type="text/css" href="/../yui282/yui/build/tabview/assets/skins/sam/tabview.css" />
    
    <style type="text/css">
    #myAutoComplete {
        width:25em; /* set width here or else widget will expand to fit its container */
        padding-bottom:2em;
    }
    </style>
    
    <!-- Individual YUI JS files -->
    <script type="text/javascript" src="/../yui282/yui/build/yahoo-dom-event/yahoo-dom-event.js"></script> 
    <script type="text/javascript" src="/../yui282/yui/build/connection/connection-min.js"></script> 
    <script type="text/javascript" src="/../yui282/yui/build/dragdrop/dragdrop-min.js"></script>
    <script type="text/javascript" src="/../yui282/yui/build/history/history-min.js"></script>
    <script type="text/javascript" src="/../yui282/yui/build/element/element-min.js"></script>
    <script type="text/javascript" src="/../yui282/yui/build/paginator/paginator-min.js"></script>
    <script type="text/javascript" src="/../yui282/yui/build/datasource/datasource-min.js"></script>
    <script type="text/javascript" src="/../yui282/yui/build/datatable/datatable-min.js"></script>
    <script type="text/javascript" src="/../yui282/yui/build/json/json-min.js"></script>
    <script type="text/javascript" src="/../yui282/yui/build/animation/animation-min.js"></script>
    <script type="text/javascript" src="/../yui282/yui/build/container/container-min.js"></script>
    <script type="text/javascript" src="/../yui282/yui/build/progressbar/progressbar-min.js"></script>
    <script type="text/javascript" src="/../yui282/yui/build/dom/dom-min.js"></script>
    <script type="text/javascript" src="/../yui282/yui/build/button/button-min.js"></script>
    <script type="text/javascript" src="/../yui282/yui/build/tabview/tabview-min.js"></script>
    
    <script type="text/javascript" src="/../yui282/yui/build/element/element-min.js"></script>
    
    <script type="text/javascript" src="/../yui282/yui/build/autocomplete/autocomplete-min.js"></script>
    <script type="text/javascript" src="https://img.jgi.doe.gov/m/../js/header.js"></script>
    
    
    
    <script type="text/javascript">
    
      var _gaq = _gaq || [];
      _gaq.push(['_setAccount', 'UA-15689341-4']);
      _gaq.push(['_setDomainName', 'jgi.doe.gov']);
      _gaq.push(['_trackPageview']);
    
      (function() {
        var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
        ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
      })();
    
    </script>
    
    <script type="text/javascript">
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
    
    ga('create', 'UA-15689341-4', 'auto');
    ga('send', 'pageview');
    
    </script>
    
    </head>
    
    <body id="body_frame" class="yui-skin-sam">
    
    
    
    
    <header id="jgi-header">
    <div id="jgi-logo">
    <a href="/" title="DOE Joint Genome Institute - IMG">
    <img width="480" height="70" src="https://img.jgi.doe.gov//images/logo-JGI-IMG.png" alt="DOE Joint Genome Institute's IMG logo"/>
    </a>
    </div>
    
            <div id="quicksearch">
            <form name="taxonSearchForm" enctype="application/x-www-form-urlencoded" action="main.cgi" method="post">
                <input type="hidden" value="orgsearch" name="page">
                <input type="hidden" value="TaxonSearch" name="section">
    
                <a style="color: black;" href="https://img.jgi.doe.gov/m/orgsearch.html">
                <font style="color: black;"> Quick Genome Search: </font>
                </a><br/>
                <div id="myAutoComplete" >
                <input id="myInput" type="text" style="width: 110px; height: 20px;" name="taxonTerm" size="12" maxlength="256">
                <input type="submit" alt="Go" value='Go' name="_section_TaxonSearch_x" style="vertical-align: middle; margin-left: 125px;">
                <div id="myContainer"></div>
                </div>
            </form>
            </div>
                <script type="text/javascript">
    YAHOO.example.BasicRemote = function() {
        // Use an XHRDataSource
        var oDS = new YAHOO.util.XHRDataSource("https://img.jgi.doe.gov/api/autocompleteAll.php");
        // Set the responseType
        oDS.responseType = YAHOO.util.XHRDataSource.TYPE_TEXT;
        // Define the schema of the delimited results
        oDS.responseSchema = {
            recordDelim: "\n",
            fieldDelim: "\t"
        };
        // Enable caching
        oDS.maxCacheEntries = 5;
    
        // Instantiate the AutoComplete
        var oAC = new YAHOO.widget.AutoComplete("myInput", "myContainer", oDS);
    
        return {
            oDS: oDS,
            oAC: oAC
        };
    }();
    </script>
    
    
    <div id="login">
      <br><span style="cursor:pointer;"  title="Login to view your private data sets in IMG/MER"> 
      Login into <a href="https://signon.jgi.doe.gov/signon" onclick="document.cookie = 'jgi_return=https://img.jgi.doe.gov//cgi-bin/mer/main.cgi; path=/; domain=.jgi.doe.gov'" >IMG/MER</a>
      </span>
    </div>
                
    </header>
    <div id="myclear"></div>
            <script>
    function ConfirmDelete()
    {
      var x = confirm("Are you sure you want to DELETE ALL analysis cart's items?");
      if (x) {
          //alert("do delete now - TODO");
          var handleSuccess = function(o) {
              var e = document.getElementById('genome_cart');
              e.innerHTML = 0;                    
    
              var e = document.getElementById('scaffold_cart');
              e.innerHTML = 0;                    
    
              var e = document.getElementById('function_cart');
              e.innerHTML = 0;                    
    
              var e = document.getElementById('gene_cart');
              e.innerHTML = 0;  
    
              var e = document.getElementById('genome_history_cart');
              e.innerHTML = 0;  
    
              var e = document.getElementById('gene_history_cart');
              e.innerHTML = 0;  
    
              
              
    
              alert("All analysis cart's items have been removed. A page refresh maybe required.");
              
              document.getElementById("cartDeleteAll").src="/images/cancel.png";
          }
    
          var handleFailure = function(o) {
              if (o.status == -1) {
                  alert("Connection Timeout: " + o.statusText);
              } else if (o.status == 0) {
                  alert("Server Error: " + o.statusText);
              } else {
                  alert("Failure: " + o.statusText);
              }
          }
    
          var callback = {
                  success : handleSuccess,
                  failure : handleFailure,
                  timeout : 30000
          }
          
          document.getElementById("cartDeleteAll").src="/images/ajax-loader2.gif";
          
          var request = YAHOO.util.Connect.asyncRequest('GET', 
                  'xml.cgi?section=Cart&page=clearAllCarts',
                  callback);
          
          return true;
      } else {
        return false;
      }
    }
    </script>
    
    <style>
    
    .cartDeleteAll {
    width: 15px;
    height: 15px;
    vertical-align: middle; 
    cursor:pointer;
    }
    
    .cartDeleteAll:active {
        transform: translateY(1px);
    }
    
    
    </style>
    
    <div id="cart">
     &nbsp;&nbsp; <span title="Carts are unsaved sets and sets are lost during session logouts">My Analysis Carts**:</span> 
     &nbsp;&nbsp; <span id='genome_cart'>0</span> <a href='main.cgi?section=GenomeCart&page=genomeCart'  onclick="">Genomes</a> &nbsp;&nbsp;
    |&nbsp;&nbsp; <span id='scaffold_cart'>0</span> <a href='main.cgi?section=ScaffoldCart&page=index'  onclick="">Scaffolds</a>&nbsp;&nbsp;
    |&nbsp;&nbsp; <span id='function_cart'>0</span> <a href='main.cgi?section=FuncCartStor&page=funcCart'  onclick="">Functions</a> &nbsp;&nbsp;
    |&nbsp;&nbsp; <span id='gene_cart'>0</span> <a href='main.cgi?section=GeneCartStor&page=geneCart'  onclick="">Genes</a>
    |&nbsp;&nbsp; <span id='genome_history_cart'>0</span> <a href='main.cgi?section=GenomeSearch&page=searchForm'  onclick="">Genome Search History</a>
    |&nbsp;&nbsp; <span id='gene_history_cart'>0</span> <a href='main.cgi?section=GeneSearch&page=searchForm'  onclick="">Gene Search History</a>
    
    
    
    
    
    
    
    </div>
        <div id="myclear"></div>
        <div id='menu'>
    <ul id='nav'>
        <li title='IMG Landing Page'><a href="/"> Home </a>
        </li>
        <li title='IMG Data Marts'><a href="main.cgi"> IMG/M </a>
        <ul>
            <li class="sub" title='IMG only public data'><a href="/m/"><img class='menuimg' src='../../images/img_ico.png'/> IMG/M </a>
            </li>
            <li class="sub" title='IMG ER Expert Review'><a href="/mer/"><img class='menuimg' src='../../images/img_m_ico.png'/> IMG/M ER </a>
            </li>
            <li class="sub" title='IMG ABC biosynthetic gene clusters and novel secondary metabolites'><a href="/abc/"><img class='menuimg' src='../../images/abc_favicon.ico'/> IMG ABC </a>
            </li>
            <li class="sub" title='IMG Viral'><a href="/vr/"><img class='menuimg' src='../../images/img_ico.png'/> IMG VR </a>
            </li>
            <li class="sub" title='Proportal - Beta'><a href="/proportal/"> IMG Proportal - Beta </a>
            </li>
            <li class="sub" title='Data set submission'><a href="https://img.jgi.doe.gov/submit/"><img class='menuimg' src='../../images/favicon.ico'/> Submit Data Set </a>
            </li>
        </ul>
        </li>
        <li ><a href="main.cgi?section=GenomeSearch&page=searchForm"> Find Genomes </a>
        <ul>
            <li class="sub2" ><a href="main.cgi?section=TreeFile&page=txs&type=taxonomy"> Genome Browser <img class='subarrow' src='../../images/ArrowNav.gif'/></a>
            <ul>
               <li class="sub3" ><a href="main.cgi?section=TreeFile&page=txs&type=taxonomy"><img class='menuimg' src='../../images/browse_icon.png'/> Genomes by Taxonomy </a>
                </li>
               <li class="sub3" ><a href="main.cgi?section=TreeFile&page=txs&type=ecosystem"><img class='menuimg' src='../../images/browse_icon.png'/> Genomes by Ecosystem </a>
                </li>
            </ul>
            </li>
            <li class="sub" ><a href="main.cgi?section=GenomeSearch&page=searchForm"><img class='menuimg' src='../../images/binocular.png'/> Genome Search </a>
            </li>
            <li class="sub" ><a href="main.cgi?section=ScaffoldSearch"><img class='menuimg' src='../../images/binocular.png'/> Scaffold Search </a>
            </li>
            <li class="sub2" ><a href="main.cgi?section=MetagenomeBins&page=info"> Metagenome Bins <img class='subarrow' src='../../images/ArrowNav.gif'/></a>
            <ul>
               <li class="sub3" ><a href="main.cgi?section=MetagenomeBins&page=bins&type=taxonomy"><img class='menuimg' src='../../images/browse_icon.png'/> Bins by Taxonomy </a>
                </li>
               <li class="sub3" ><a href="main.cgi?section=MetagenomeBins&page=bins&type=ecosystem"><img class='menuimg' src='../../images/browse_icon.png'/> Bins by Ecosystem </a>
                </li>
            </ul>
            </li>
            <li class="sub" ><a href="main.cgi?section=TaxonDeleted"> Deleted Genomes </a>
            </li>
        </ul>
        </li>
        <li ><a href="main.cgi?section=GeneSearch&page=searchForm"> Find Genes </a>
        <ul>
            <li class="sub" ><a href="main.cgi?section=GeneSearch&page=searchForm"><img class='menuimg' src='../../images/binocular.png'/> Gene Search </a>
            </li>
            <li class="sub" ><a href="main.cgi?section=GeneCassetteSearch&page=form"><img class='menuimg' src='../../images/binocular.png'/> Cassette Search </a>
            </li>
            <li class="sub2" ><a href="main.cgi?section=FindGenesBlast&page=geneSearchBlast"> BLAST <img class='subarrow' src='../../images/ArrowNav.gif'/></a>
            <ul>
               <li class="sub3" ><a href="main.cgi?section=FindGenesBlast&page=geneSearchBlast"> Selected Genomes </a>
                </li>
               <li class="sub3" ><a href="main.cgi?section=WorkspaceBlast&page=16form"> 16s RNA </a>
                </li>
               <li class="sub3" ><a href="main.cgi?section=WorkspaceBlast&page=viralform"> Virus </a>
                </li>
               <li class="sub3" ><a href="main.cgi?section=WorkspaceBlast&page=spacersform"> CRISPR Spacers </a>
                </li>
               <li class="sub3" ><a href="main.cgi?section=WorkspaceBlast&page=isolateform"> All Isolates </a>
                </li>
            </ul>
            </li>
            <li class="sub2" ><a href="main.cgi?section=GeneCassetteProfiler&page=genetools"> Phylogenetic Profilers <img class='subarrow' src='../../images/ArrowNav.gif'/></a>
            <ul>
               <li class="sub3" ><a href="main.cgi?section=PhylogenProfiler&page=phyloProfileForm"> Single Genes </a>
                </li>
               <li class="sub3" ><a href="main.cgi?section=GeneCassetteProfiler&page=geneContextPhyloProfiler2"> Gene Cassettes </a>
                </li>
            </ul>
            </li>
        </ul>
        </li>
        <li ><a href="main.cgi?section=FindFunctions&page=findFunctions"> Find Functions </a>
        <ul>
            <li class="sub" ><a href="main.cgi?section=FindFunctions&page=findFunctions"><img class='menuimg' src='../../images/binocular.png'/> Function Search </a>
            </li>
            <li class="sub" ><a href="main.cgi?section=AllPwayBrowser&page=allPwayBrowser"><img class='menuimg' src='../../images/binocular.png'/> Search Pathways </a>
            </li>
            <li class="sub" title='Secondary Metabolism in IMG ABC Data Mart'><a href="https://img.jgi.doe.gov/abc/"><img class='menuimg' src='../../images/abc_favicon.ico'/> Secondary Metabolism </a>
            </li>
            <li class="sub2" ><a href="main.cgi?section=FindFunctions&page=ffoAllCogCategories"><img class='menuimg' src='../../images/cog.png'/> COG <img class='subarrow' src='../../images/ArrowNav.gif'/></a>
            <ul>
               <li class="sub3" ><a href="main.cgi?section=FindFunctions&page=ffoAllCogCategories"> COG Browser </a>
                </li>
               <li class="sub3" title='List of COG IDs'><a href="main.cgi?section=FindFunctions&page=cogList"> COG List </a>
                </li>
               <li class="sub3" title='List of COG IDs with Gene Count (This is SLOW)'><a href="main.cgi?section=FindFunctions&page=cogList&stats=1"> COG List w/ Stats </a>
                </li>
               <li class="sub3" ><a href="main.cgi?section=FindFunctions&page=cogid2cat"> COG ID to Categories </a>
                </li>
            </ul>
            </li>
            <li class="sub2" ><a href="main.cgi?section=FindFunctions&page=ffoAllKogCategories"><img class='menuimg' src='../../images/kog.png'/> KOG <img class='subarrow' src='../../images/ArrowNav.gif'/></a>
            <ul>
               <li class="sub3" ><a href="main.cgi?section=FindFunctions&page=ffoAllKogCategories"> KOG Browser </a>
                </li>
               <li class="sub3" title='List of KOG Ids'><a href="main.cgi?section=FindFunctions&page=kogList"> KOG List </a>
                </li>
               <li class="sub3" title='List of KOG Ids with Gene Count (This is SLOW)'><a href="main.cgi?section=FindFunctions&page=kogList&stats=1"> KOG List w/ Stats </a>
                </li>
            </ul>
            </li>
            <li class="sub2" ><a href="main.cgi?section=FindFunctions&page=pfamCategories"><img class='menuimg' src='../../images/pfam.png'/> Pfam <img class='subarrow' src='../../images/ArrowNav.gif'/></a>
            <ul>
               <li class="sub3" ><a href="main.cgi?section=FindFunctions&page=pfamCategories"> Pfam Browser </a>
                </li>
               <li class="sub3" title='List of Pfam Ids'><a href="main.cgi?section=FindFunctions&page=pfamList"> Pfam List </a>
                </li>
               <li class="sub3" title='List of Pfam Ids with Gene Count (This is SLOW)'><a href="main.cgi?section=FindFunctions&page=pfamList&stats=1"> Pfam List w/ Stats </a>
                </li>
               <li class="sub3" ><a href="main.cgi?section=FindFunctions&page=pfamListClans"> Pfam Clans </a>
                </li>
            </ul>
            </li>
            <li class="sub2" ><a href="main.cgi?section=TigrBrowser&page=tigrBrowser"><img class='menuimg' src='../../images/tigrfam.png'/> TIGRfam <img class='subarrow' src='../../images/ArrowNav.gif'/></a>
            <ul>
               <li class="sub3" ><a href="main.cgi?section=TigrBrowser&page=tigrBrowser"> TIGRfam Roles </a>
                </li>
               <li class="sub3" ><a href="main.cgi?section=TigrBrowser&page=tigrfamList"> TIGRfam List </a>
                </li>
               <li class="sub3" ><a href="main.cgi?section=TigrBrowser&page=tigrfamList&stats=1"> TIGRfam List w/ Stats </a>
                </li>
            </ul>
            </li>
            <li class="sub2" ><a href="main.cgi?section=FindFunctions&page=ffoAllKeggPathways&view=brite"><img class='menuimg' src='../../images/kegg.png'/> KEGG <img class='subarrow' src='../../images/ArrowNav.gif'/></a>
            <ul>
               <li class="sub3" ><a href="main.cgi?section=KeggPathwayDetail&page=koList"> KO List </a>
                </li>
               <li class="sub3" ><a href="main.cgi?section=KeggPathwayDetail&page=koList&stats=1"> KO List w/ Stats </a>
                </li>
               <li class="sub3" ><a href="main.cgi?section=KeggPathwayDetail&page=keggmodulelist"> KEGG Module List </a>
                </li>
               <li class="sub3" ><a href="main.cgi?section=KeggPathwayDetail&page=keggmodulelist&stats=1"> KEGG Module List w/ Stats </a>
                </li>
               <li class="sub3" ><a href="main.cgi?section=FindFunctions&page=ffoAllKeggPathways&view=brite"> Orthology KO Terms </a>
                </li>
               <li class="sub3" ><a href="main.cgi?section=FindFunctions&page=ffoAllKeggPathways&view=ko"> Pathways via KO Terms </a>
                </li>
            </ul>
            </li>
            <li class="sub2" ><a href="main.cgi?section=ImgNetworkBrowser&page=imgNetworkBrowser"><img class='menuimg' src='../../images/favicon.ico'/> IMG Networks <img class='subarrow' src='../../images/ArrowNav.gif'/></a>
            <ul>
               <li class="sub3" ><a href="main.cgi?section=ImgNetworkBrowser&page=imgNetworkBrowser"><img class='menuimg' src='../../images/favicon.ico'/> IMG Network Browser </a>
                </li>
               <li class="sub3" ><a href="main.cgi?section=ImgPartsListBrowser&page=browse"><img class='menuimg' src='../../images/favicon.ico'/> IMG Parts List </a>
                </li>
               <li class="sub3" ><a href="main.cgi?section=ImgPwayBrowser&page=imgPwayBrowser"><img class='menuimg' src='../../images/favicon.ico'/> IMG Pathways </a>
                </li>
               <li class="sub3" ><a href="main.cgi?section=ImgTermBrowser&page=imgTermBrowser"><img class='menuimg' src='../../images/favicon.ico'/> IMG Terms </a>
                </li>
            </ul>
            </li>
            <li class="sub" ><a href="main.cgi?section=FindFunctions&page=enzymeList"><img class='menuimg' src='../../images/kegg-ec.png'/> Enzyme </a>
            </li>
            <li class="sub" ><a href="main.cgi?section=MetaCyc"> MetaCyc </a>
            </li>
            <li class="sub" ><a href="main.cgi?section=ImgPwayBrowser&page=phenoRules"> Phenotypes </a>
            </li>
            <li class="sub" ><a href="main.cgi?section=Interpro"><img class='menuimg' src='../../images/interpro.png'/> InterPro Browser </a>
            </li>
        </ul>
        </li>
        <li ><a href="main.cgi?section=CompareGenomes&page=compareGenomes"> Compare Genomes </a>
        <ul>
            <li class="sub" ><a href="main.cgi?section=CompareGenomes&page=compareGenomes"> Genome Statistics </a>
            </li>
            <li class="sub2" ><a href="main.cgi?section=Vista&page=toppage"> Synteny Viewers <img class='subarrow' src='../../images/ArrowNav.gif'/></a>
            <ul>
               <li class="sub3" ><a href="main.cgi?section=DotPlot&page=plot"><img class='menuimg' src='../../images/dotplot_icon.png'/> Dot Plot </a>
                </li>
               <li class="sub3" ><a href="main.cgi?section=Artemis&page=ACTForm"><img class='menuimg' src='../../images/sanger-ico.png'/> Artemis ACT </a>
                </li>
            </ul>
            </li>
            <li class="sub2" ><a href="main.cgi?section=AbundanceProfiles&page=topPage"> Abundance Profiles <img class='subarrow' src='../../images/ArrowNav.gif'/></a>
            <ul>
               <li class="sub3" ><a href="main.cgi?section=AbundanceProfiles&page=mergedForm"> Overview (All Functions) </a>
                </li>
               <li class="sub3" ><a href="main.cgi?section=AbundanceProfileSearch"> Search </a>
                </li>
               <li class="sub3" ><a href="main.cgi?section=AbundanceComparisons"> Function Comparisons </a>
                </li>
               <li class="sub3" ><a href="main.cgi?section=AbundanceComparisonsSub"> Function Category Comparisons </a>
                </li>
            </ul>
            </li>
            <li class="sub2" ><a href="main.cgi?section=MetagPhyloDist&page=top"> Phylogenetic Dist. <img class='subarrow' src='../../images/ArrowNav.gif'/></a>
            <ul>
               <li class="sub3" ><a href="main.cgi?section=MetagPhyloDist&page=form"> Metagenomes vs Genomes </a>
                </li>
               <li class="sub3" ><a href="main.cgi?section=GenomeHits"> Genome vs Metagenomes </a>
                </li>
               <li class="sub3" ><a href="main.cgi?section=RadialPhyloTree"><img class='menuimg' src='../../images/radialtree_ico.png'/> Radial Tree </a>
                </li>
            </ul>
            </li>
            <li class="sub2" title='ANI'><a href="main.cgi?section=ANI"> Avg Nucleotide Ident. <img class='subarrow' src='../../images/ArrowNav.gif'/></a>
            <ul>
               <li class="sub3" ><a href="main.cgi?section=ANI&page=pairwise"> Pairwise ANI </a>
                </li>
               <li class="sub3" ><a href="main.cgi?section=ANI&page=doSameSpeciesPlot"> Same Species Plot </a>
                </li>
               <li class="sub3" ><a href="main.cgi?section=ANI&page=overview"> ANI Clusters </a>
                </li>
            </ul>
            </li>
            <li class="sub" ><a href="main.cgi?section=FunctionProfiler&page=profiler"> Function Profile </a>
            </li>
            <li class="sub" ><a href="main.cgi?section=EgtCluster&page=topPage"> Genome Clustering </a>
            </li>
            <li class="sub" title='Genome Gene Best Homologs'><a href="main.cgi?section=GenomeGeneOrtholog"> Genome Gene Best Hmlgs </a>
            </li>
        </ul>
        </li>
        <li ><a href="main.cgi?section=ImgStatsOverview#tabview=tab3"> OMICS </a>
        <ul>
            <li class="sub" ><a href="main.cgi?section=IMGProteins&page=proteomics"> Protein </a>
            </li>
            <li class="sub" ><a href="main.cgi?section=RNAStudies&page=rnastudies"> RNASeq </a>
            </li>
            <li class="sub" ><a href="main.cgi?section=Methylomics&page=methylomics"> Methylation </a>
            </li>
        </ul>
        </li>
        <li ><a href="main.cgi?section=MyIMG"> My IMG </a>
        <ul>
            <li class="sub" ><a href="main.cgi?section=MyIMG&page=home"> MyIMG Home </a>
            </li>
            <li class="sub" ><a href="main.cgi?section=MyIMG&page=preferences"> Preferences </a>
            </li>
        </ul>
        </li>
        <li class="rightmenu"><a href="/help.html"> Help </a>
        </li>
    </ul>
    
            </div> <!-- end menu div -->
    <div id="myclear"></div>
    <div id="container">        
        
        <div id="breadcrumbs_frame">
        <div id="breadcrumbs"> <a href='main.cgi'  onclick="">Home</a> &gt; Find Genomes </div>
        <div id="loading">  <font color='red'> Loading... </font> <img src='https://img.jgi.doe.gov//images/ajax-loader.gif'/> </div>
        
        <div id="page_help">
        
            &nbsp;
            
        </div>
        <div id="myclear"></div>
        </div>
        <noscript>
        <!-- style="display: block" overrides the default of css display: none -->
        <div id="error_content_js"
            class="error_frame shadow"
            style="display: block">
            <img src='https://img.jgi.doe.gov/m/images/announcementsIcon.gif'/>
            Your browser does not have JavaScript enabled. Please enable JavaScript to view IMG data
            accurately.
         </div>
    </noscript>
    
    <div id="error_content"
        class="error_frame shadow"
        style="display: none">
    </div>
    
    <!-- # IE must be IE 8+ for new css  -->
    <!--[if lt IE 7]>
    <div id="error_content_js" class="error_frame shadow" style="display: block" >
        You should upgrade your copy of Internet Explorer (IE 8+) to view IMG accurately. 
    </div>      
    <![endif]--> 
    
    <div id="message_content_file" class="message_frame shadow" style="display: none" >
        
    </div> 
    
    
    <script type="text/javascript">
    var sysreqUrl = " See our <a href='https://img.jgi.doe.gov/m/../systemreqs.html'> System Requirements</a>";
    
    // cookies enabled
    if(! navigator.cookieEnabled) {
        var div = document.getElementById('error_content');
        div.style.display = "block";
        div.innerHTML = "Please enable and accept cookies from *.jgi.doe.gov and *.jgi-psf.org." + sysreqUrl;  
    }
    
    //e.g. Firefox
    if (YAHOO.env.ua.gecko > 0) {
        //document.write("<br/> FireFox " + YAHOO.env.ua.gecko);
        var v = YAHOO.env.ua.gecko;
        if(v < 19) {
            var div = document.getElementById('error_content');
            div.style.display = "block";
            div.innerHTML = "Please update your FireFox to view IMG data accurately."  + sysreqUrl;
        }
    }  
    
    //Microsoft Internet Explorer
    // Or leverage boolean coercion -- 0 evaulates as false
    if (YAHOO.env.ua.ie > 0) {
        //document.write(" IE " + YAHOO.env.ua.ie);
        var v = YAHOO.env.ua.ie;
        if(v < 8) {
            var div = document.getElementById('error_content');
            div.style.display = "block";
            div.innerHTML = "Please update your IE to view IMG data accurately."  + sysreqUrl;
        }    
    }
    
    //Opera
    if (YAHOO.env.ua.opera) {
        //document.write(" Opera " + YAHOO.env.ua.opera);
    }
    
    //Chrome
    if(YAHOO.env.ua.chrome) {
        //document.write("<br/> Chrome " + YAHOO.env.ua.chrome + "<br/>");
        var v = YAHOO.env.ua.chrome;
        if(v < 25) {
            var div = document.getElementById('error_content');
            div.style.display = "block";
            div.innerHTML = "Please update your Chrome to view IMG data accurately."  + sysreqUrl;
        }    
    }
    
    
    //Safari, Webkit and Chrome
    if (YAHOO.env.ua.webkit) {
        //document.write("<br/> Safari, Webkit " + YAHOO.env.ua.webkit +' ' + YAHOO.env.ua.chrome);
        var v = YAHOO.env.ua.webkit;
        if(v < 534) {
            var div = document.getElementById('error_content');
            div.style.display = "block";
            div.innerHTML = "Please update your browser to view IMG data accurately.";    
        }     
    } 
    
    
    
    </script>
    
        <div id="content_other">
        <form method="post" action="main.cgi" enctype="multipart/form-data" name="mainForm"><h1>
    Streptomyces sp. MBT76
    </h1>
    <input type='hidden' id='taxon_filter_oid' name='taxon_filter_oid' value='2724679019' />
    
              <input type="submit" class="smdefbutton" style="vertical-align:top;margin-top:0;padding-top:8px;
               padding-bottom:6px;" value="Add to Genome Cart" name="setTaxonFilter">
        &nbsp; &nbsp; &nbsp; &nbsp; 
            <a class="genome-btn browse-btn" href="#browse" title="Browse Genome">
                <span>Browse Genome</span>
            </a>
        &nbsp; &nbsp; &nbsp; &nbsp; 
            <a class="genome-btn blast-btn" href="main.cgi?section=FindGenesBlast&page=geneSearchBlast&taxon_oid=2724679019&domain=Bacteria"
            title="BLAST Genome"><span>BLAST Genome</span></a>
        &nbsp; &nbsp; &nbsp; &nbsp; 
            <a class="genome-btn download-btn" href="https://genome.jgi.doe.gov/portal/IMG_2724679019/IMG_2724679019.info.html"
            onClick="_gaq.push(['_trackEvent', 'Download Data', 'JGI Portal', '2724679019']);"
            title="Download Data requires an account"><span>Download Data</span></a>
            
                <p>
                <span class="boldTitle">About Genome</span>
                <ul style="padding-left:1.2em;list-style-type:circle">
                <li><a href="#overview">Overview</a></li>
                <li><a href="#statistics">Statistics</a></li>
            
            <li><a href="#genes">Genes</a></li>
            </ul>
            </p>
                <p></p><a name='overview' href='#'><h2>Overview</h2> </a>
    <table class='img' border='1' style='max-width:1024px;' >
    <tr class='img' >
      <th class='subhead' align='right'>Study Name (Proposal Name)</th>
      <td class='img'   align='left'>Streptomyces sp. MBT76 genome sequencing</td>
    </tr>
    <tr class='img' >
      <th class='subhead' align='right'>Organism Name</th>
      <td class='img'   align='left'>Streptomyces sp. MBT76</td>
    </tr>
    <tr class='img' >
      <th class='subhead' align='right'>Taxon ID</th>
      <td class='img'   align='left'>2724679019</td>
    </tr>
    <tr class='img' >
      <th class='subhead' align='right'>IMG Submission ID</th>
      <td class='img'   align='left'><a href='https://img.jgi.doe.gov/cgi-bin/submit/main.cgi?section=ERSubmission&page=displaySubmission&submission_id=112211'  onclick="">112211</a></td>
    </tr>
    <tr class='img' >
      <th class='subhead' align='right'>NCBI Taxon ID</th>
      <td class='img'   align='left'><a href='http://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=1488406'  onclick="">1488406</a></td>
    </tr>
    <tr class='img'>
    <th class='subhead'>
    GOLD ID in IMG Database</th>
    <td class='img'>
    <a href='https://gold.jgi.doe.gov/study?id=Gs0119030'  onclick="">Study ID: Gs0119030</a>&nbsp;&nbsp;<a href='https://gold.jgi.doe.gov/projects?id=Gp0143069'  onclick="">Project ID: Gp0143069</a></td>
    </tr>
    <tr class='img'>
    <th class='subhead'>
    GOLD Analysis Project Id</th>
    <td class='img'>
    <a href='https://gold.jgi.doe.gov/analysis_projects?id=Ga0125954'  onclick="">Ga0125954</a></td>
    </tr>
    <tr class='img' >
      <th class='subhead' align='right'>GOLD Analysis Project Type</th>
      <td class='img'   align='left'>Genome Analysis</td>
    </tr>
    <tr class='img' >
      <th class='subhead' align='right'>Submission Type</th>
      <td class='img'   align='left'>Primary</td>
    </tr>
    <tr class='img' >
      <th class='subhead' align='right'>JGI Analysis Project Type</th>
      <td class='img'   align='left'>Genome Analysis</td>
    </tr>
    <tr class='img'>
    <th class='subhead'>External Links</th>
    <td class='img'>
    <a href="https://genome.jgi.doe.gov/portal/IMG_2724679019/IMG_2724679019.info.html" onClick="_gaq.push(['_trackEvent', 'Download Data', 'JGI Portal', '2724679019']);" > 
                   <img style='border:none; vertical-align:text-top;'
                     src='https://img.jgi.doe.gov/m/images/genomeProjects_icon.gif' />
                 JGI Portal </a>&nbsp; </td>
    </tr>
    <tr class='img' >
    <th class='subhead' align='right'>Lineage</th>
    <td class='img' ><a href='main.cgi?section=TaxonList&page=lineageMicrobes&domain=Bacteria'  onclick="">Bacteria</a>; <a href='main.cgi?section=TaxonList&page=lineageMicrobes&domain=Bacteria&phylum=Actinobacteria'  onclick="">Actinobacteria</a>; <a href='main.cgi?section=TaxonList&page=lineageMicrobes&domain=Bacteria&ir_class=Actinobacteria'  onclick="">Actinobacteria</a>; <a href='main.cgi?section=TaxonList&page=lineageMicrobes&domain=Bacteria&ir_order=Streptomycetales'  onclick="">Streptomycetales</a>; <a href='main.cgi?section=TaxonList&page=lineageMicrobes&domain=Bacteria&family=Streptomycetaceae'  onclick="">Streptomycetaceae</a>; <a href='main.cgi?section=TaxonList&page=lineageMicrobes&domain=Bacteria&genus=Streptomyces'  onclick="">Streptomyces</a>; <a href='main.cgi?section=TaxonList&page=lineageMicrobes&domain=Bacteria&species=Streptomyces+sp.+MBT76'  onclick="">Streptomyces sp. MBT76</a></td>
    </tr>
    <tr class='img' >
      <th class='subhead' align='right'>Sequencing Status</th>
      <td class='img'   align='left'>Permanent Draft</td>
    </tr>
    <tr class='img' >
      <th class='subhead' align='right'>Sequencing Center</th>
      <td class='img'   align='left'>Institute of Biology Leiden</td>
    </tr>
    <tr class='img' >
      <th class='subhead' align='right'>JGI Sequencing Annotation</th>
      <td class='img'   align='left'><a href='http://jgi.doe.gov/ncbi-genomes-processed-img-pipeline-inclusion-img/'  onclick="">This NCBI acquired genome has been re-annotated by JGI&#39;s gene calling methods</a></td>
    </tr>
    <tr class='img' >
      <th class='subhead' align='right'>IMG Release/Pipeline Version</th>
      <td class='img'   align='left'>IMG Annotation Pipeline v.4.14.7</td>
    </tr>
    <tr class='img' >
    <th class='subhead' style='min-width: 170px;' >Comment</th>
    <td class='img' >
    
    </td>
    </tr>
    <tr class='img' >
    <th class='subhead'> Release Date </th>
    <td class='img' >
    2017-04-11</td></tr>
    <tr class='img' >
    <th class='subhead'> Add Date </th>
    <td class='img' >
    2017-04-11</td></tr>
    <tr class='img' >
    <th class='subhead'> Modified Date </th>
    <td class='img' >
    </td></tr>
    <tr class='img' >
    <th class='subhead'> High Quality </th>
    <td class='img' >
    Yes</td></tr>
    <tr class='img' >
    <th class='subhead'>IMG Product Flag </th>
    <td class='img' >
    Yes</td></tr>
    <tr class='img' >
      <th class='subhead' align='right'>Is Public</th>
      <td class='img'   align='left'>Yes</td>
    </tr>
    <tr class='img' >
      <th class='subhead' align='right'>Genome Completeness %</th>
      <td class='img'   align='left'></td>
    </tr>
    <script type="text/javascript" src="/js/genomeDetail.js"></script>
    <tr class='highlight'>
    <th class='subhead'>Project Information</th>  <th class='subhead'> &nbsp; </th></tr>
    <tr class='img' >
      <th class='subhead' align='right'>Culture Type</th>
      <td class='img'   align='left'>Isolate</td>
    </tr>
    <tr class='img' >
      <th class='subhead' align='right'>Cultured</th>
      <td class='img'   align='left'>Yes</td>
    </tr>
    <tr class='img' >
      <th class='subhead' align='right'>GOLD Sequencing Strategy</th>
      <td class='img'   align='left'>Whole Genome Sequencing</td>
    </tr>
    <tr class='img' >
      <th class='subhead' align='right'>Geographic Location</th>
      <td class='img'   align='left'>China: Xi'an, Shanxi Province</td>
    </tr>
    <tr class='img' >
      <th class='subhead' align='right'>Gram Staining</th>
      <td class='img'   align='left'>Gram+</td>
    </tr>
    <tr class='img' >
      <th class='subhead' align='right'>Is Published</th>
      <td class='img'   align='left'>No</td>
    </tr>
    <tr class='img' >
      <th class='subhead' align='right'>Isolation</th>
      <td class='img'   align='left'>Soil</td>
    </tr>
    <tr class='img' >
      <th class='subhead' align='right'>Latitude</th>
      <td class='img'   align='left'>34.0578</td>
    </tr>
    <tr class='img' >
      <th class='subhead' align='right'>Longitude</th>
      <td class='img'   align='left'>109.3775</td>
    </tr>
    <tr class='img' >
      <th class='subhead' align='right'>NCBI Bioproject Accession</th>
      <td class='img'   align='left'><a href='http://www.ncbi.nlm.nih.gov/bioproject/PRJNA301664'  onclick="">PRJNA301664</a></td>
    </tr>
    <tr class='img' >
      <th class='subhead' align='right'>NCBI Biosample Accession</th>
      <td class='img'   align='left'><a href='http://www.ncbi.nlm.nih.gov/biosample/SAMN04253747'  onclick="">SAMN04253747</a></td>
    </tr>
    <tr class='img' >
      <th class='subhead' align='right'>Relevance</th>
      <td class='img'   align='left'>Medical</td>
    </tr>
    <tr class='img' >
      <th class='subhead' align='right'>Seq Status</th>
      <td class='img'   align='left'>Complete</td>
    </tr>
    <tr class='img' >
      <th class='subhead' align='right'>Sequencing Method</th>
      <td class='img'   align='left'>Illumina HiSeq</td>
    </tr>
    <tr class='img' >
      <th class='subhead' align='right'>Project Geographical Map</th>
      <td class='img'   align='left'><div id=geomap style='height: 300px'></div></td>
    </tr>
    
        <script type="text/javascript" src="https://img.jgi.doe.gov//js/leaflet-1.3.4.js"></script>
        <link rel="stylesheet" type="text/css" href="https://img.jgi.doe.gov//css/leaflet-1.3.4.css" />
        <script type="text/javascript" src="https://img.jgi.doe.gov//js/leaflet.markercluster-1.4.1.js"></script>
        <link rel="stylesheet" type="text/css" href="https://img.jgi.doe.gov//css/MarkerCluster-1.4.1.css" />
        <link rel="stylesheet" type="text/css" href="https://img.jgi.doe.gov//css/MarkerCluster.Default-1.4.1.css" />
    
        <style>
        .markerlabel {
            color: red;
            text-align: center;
            border: solid 1px black; /*darkgray;*/
            background: beige; /*lightgray*/
            font-family: "Arial",sans-serif;
            font-weight: bold;
        }
        </style>
    
        <script type="text/javascript">
        // Anna: create a custom Marker class with 2 icons:
        var textIcon = L.divIcon({ 
            className: 'markerlabel',
            iconSize: new L.Point(50, 20), 
            iconAnchor: [25, -0.5]
        });
    
        var pinIcon = new L.Icon.Default();
    
        L.Marker.MarkerWithLabel = L.Marker.extend({
            options: {
                zIndexOffset: 0,
                pane: 'markerPane',
                labelOffset: L.point(0, 0.1),
                label: ""
            }, 
    
            // this._icon becomes a container for the 2 icons
            _initIcon: function() {
                var options = this.options,
                classToAdd = 'leaflet-zoom-' + (this._zoomAnimated ? 'animated' : 'hide');
    
                options.labelOffset = L.point(options.labelOffset);
                this._icon = L.DomUtil.create('div', classToAdd);
    
                var pinIconEl = pinIcon.createIcon();
                L.DomUtil.addClass(pinIconEl, 'leaflet-interactive');
                this._icon.appendChild(pinIconEl);
                this.addInteractiveTarget(pinIconEl);
    
                var textIconEl = textIcon.createIcon();
                textIconEl.innerHTML = options.label;
                L.DomUtil.addClass(textIconEl, 'leaflet-interactive');
                L.DomUtil.setPosition(textIconEl, options.labelOffset);
                this._icon.appendChild(textIconEl);
                this.addInteractiveTarget(textIconEl);
    
                this.getPane().appendChild(this._icon);
            }
        });
    
        L.marker.markerwithlabel = function(latlng, opts) {
            return new L.Marker.MarkerWithLabel(latlng, opts);
        }
    
        // create a tile layer:
        var osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        var osmAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
        var tiles = L.tileLayer(osmUrl, {
            maxZoom: 18,
            attribution: osmAttribution
        });
    
        // initialize the map on the "map" div with a given center and zoom
        var map = L.map('geomap').setView([34.05780, 109.37750], 10).addLayer(tiles);
        var markers = L.markerClusterGroup();
    
        function addMarker(map, clat, clong, info, content, scfcnt) {
            info = unescape(info);
            if (info == "") {
                info = clat + ", " + clong;
            }
            var marker = L.marker(new L.LatLng(clat, clong), {
                riseOnHover: true
            });
            marker.bindPopup(content, { maxHeight: 250 });
            marker.bindTooltip(info);
            markers.addLayer(marker);
        }
    
        function addMarkerWithLabel(map, clat, clong, info, content, scfcnt) {
            info = unescape(info);
            scfcnt = unescape(scfcnt);
            var markerwithlabel = L.marker.markerwithlabel
                ([clat, clong], {label:scfcnt, riseOnHover:true});
            markerwithlabel.bindPopup(content, { maxHeight: 250 });
            markerwithlabel.bindTooltip(info);
            markers.addLayer(markerwithlabel);
        }
        
            addMarker(map, 34.05780, 109.37750, "China: Xi&#39;an, Shanxi Province", "<div><p>China: Xi&#39;an, Shanxi Province<br>[34.0578, 109.3775] </p></div>");
        
            map.addLayer(markers);
            </script>
        </tr>
    <tr class='highlight'>
    <th class='subhead'>Phenotypes/Metabolism from Pathway Assertion</th> <th class='subhead'> &nbsp; </th> 
    <tr class='img' >
      <th class='subhead' align='right'>Metabolism</th>
      <td class='img'   align='left'><a href='main.cgi?section=TaxonDetail&page=taxonPhenoRuleDetail&taxon_oid=2724679019&rule_id=7'  onclick="">Auxotroph (L-lysine auxotroph)</a> (IMG_PIPELINE; 2017-04-19)</td>
    </tr>
    <tr class='img' >
      <th class='subhead' align='right'>Metabolism</th>
      <td class='img'   align='left'><a href='main.cgi?section=TaxonDetail&page=taxonPhenoRuleDetail&taxon_oid=2724679019&rule_id=11'  onclick="">Auxotroph (L-alanine auxotroph)</a> (IMG_PIPELINE; 2017-04-19)</td>
    </tr>
    <tr class='img' >
      <th class='subhead' align='right'>Metabolism</th>
      <td class='img'   align='left'><a href='main.cgi?section=TaxonDetail&page=taxonPhenoRuleDetail&taxon_oid=2724679019&rule_id=12'  onclick="">Prototrophic (L-aspartate prototroph)</a> (IMG_PIPELINE; 2017-04-19)</td>
    </tr>
    <tr class='img' >
      <th class='subhead' align='right'>Metabolism</th>
      <td class='img'   align='left'><a href='main.cgi?section=TaxonDetail&page=taxonPhenoRuleDetail&taxon_oid=2724679019&rule_id=14'  onclick="">Prototrophic (L-glutamate prototroph)</a> (IMG_PIPELINE; 2017-04-19)</td>
    </tr>
    <tr class='img' >
      <th class='subhead' align='right'>Metabolism</th>
      <td class='img'   align='left'><a href='main.cgi?section=TaxonDetail&page=taxonPhenoRuleDetail&taxon_oid=2724679019&rule_id=17'  onclick="">Auxotroph (L-phenylalanine auxotroph)</a> (IMG_PIPELINE; 2017-04-19)</td>
    </tr>
    <tr class='img' >
      <th class='subhead' align='right'>Metabolism</th>
      <td class='img'   align='left'><a href='main.cgi?section=TaxonDetail&page=taxonPhenoRuleDetail&taxon_oid=2724679019&rule_id=18'  onclick="">Auxotroph (L-tyrosine auxotroph)</a> (IMG_PIPELINE; 2017-04-19)</td>
    </tr>
    <tr class='img' >
      <th class='subhead' align='right'>Metabolism</th>
      <td class='img'   align='left'><a href='main.cgi?section=TaxonDetail&page=taxonPhenoRuleDetail&taxon_oid=2724679019&rule_id=21'  onclick="">Auxotroph (L-tryptophan auxotroph)</a> (IMG_PIPELINE; 2017-04-19)</td>
    </tr>
    <tr class='img' >
      <th class='subhead' align='right'>Metabolism</th>
      <td class='img'   align='left'><a href='main.cgi?section=TaxonDetail&page=taxonPhenoRuleDetail&taxon_oid=2724679019&rule_id=22'  onclick="">Auxotroph (L-histidine auxotroph)</a> (IMG_PIPELINE; 2017-04-19)</td>
    </tr>
    <tr class='img' >
      <th class='subhead' align='right'>Metabolism</th>
      <td class='img'   align='left'><a href='main.cgi?section=TaxonDetail&page=taxonPhenoRuleDetail&taxon_oid=2724679019&rule_id=23'  onclick="">Prototrophic (Glycine prototroph)</a> (IMG_PIPELINE; 2017-04-19)</td>
    </tr>
    <tr class='img' >
      <th class='subhead' align='right'>Metabolism</th>
      <td class='img'   align='left'><a href='main.cgi?section=TaxonDetail&page=taxonPhenoRuleDetail&taxon_oid=2724679019&rule_id=26'  onclick="">Auxotroph (L-arginine auxotroph)</a> (IMG_PIPELINE; 2017-04-19)</td>
    </tr>
    <tr class='img' >
      <th class='subhead' align='right'>Metabolism</th>
      <td class='img'   align='left'><a href='main.cgi?section=TaxonDetail&page=taxonPhenoRuleDetail&taxon_oid=2724679019&rule_id=27'  onclick="">Prototrophic (L-asparagine prototroph)</a> (IMG_PIPELINE; 2017-04-19)</td>
    </tr>
    <tr class='img' >
      <th class='subhead' align='right'>Metabolism</th>
      <td class='img'   align='left'><a href='main.cgi?section=TaxonDetail&page=taxonPhenoRuleDetail&taxon_oid=2724679019&rule_id=29'  onclick="">Prototrophic (L-cysteine prototroph)</a> (IMG_PIPELINE; 2017-04-19)</td>
    </tr>
    <tr class='img' >
      <th class='subhead' align='right'>Metabolism</th>
      <td class='img'   align='left'><a href='main.cgi?section=TaxonDetail&page=taxonPhenoRuleDetail&taxon_oid=2724679019&rule_id=31'  onclick="">Prototrophic (L-glutamine prototroph)</a> (IMG_PIPELINE; 2017-04-19)</td>
    </tr>
    <tr class='img' >
      <th class='subhead' align='right'>Metabolism</th>
      <td class='img'   align='left'><a href='main.cgi?section=TaxonDetail&page=taxonPhenoRuleDetail&taxon_oid=2724679019&rule_id=34'  onclick="">Auxotroph (L-isoleucine auxotroph)</a> (IMG_PIPELINE; 2017-04-19)</td>
    </tr>
    <tr class='img' >
      <th class='subhead' align='right'>Metabolism</th>
      <td class='img'   align='left'><a href='main.cgi?section=TaxonDetail&page=taxonPhenoRuleDetail&taxon_oid=2724679019&rule_id=36'  onclick="">Auxotroph (L-leucine auxotroph)</a> (IMG_PIPELINE; 2017-04-19)</td>
    </tr>
    <tr class='img' >
      <th class='subhead' align='right'>Metabolism</th>
      <td class='img'   align='left'><a href='main.cgi?section=TaxonDetail&page=taxonPhenoRuleDetail&taxon_oid=2724679019&rule_id=37'  onclick="">Prototrophic (L-proline prototroph)</a> (IMG_PIPELINE; 2017-04-19)</td>
    </tr>
    <tr class='img' >
      <th class='subhead' align='right'>Metabolism</th>
      <td class='img'   align='left'><a href='main.cgi?section=TaxonDetail&page=taxonPhenoRuleDetail&taxon_oid=2724679019&rule_id=40'  onclick="">Auxotroph (L-serine auxotroph)</a> (IMG_PIPELINE; 2017-04-19)</td>
    </tr>
    <tr class='img' >
      <th class='subhead' align='right'>Metabolism</th>
      <td class='img'   align='left'><a href='main.cgi?section=TaxonDetail&page=taxonPhenoRuleDetail&taxon_oid=2724679019&rule_id=42'  onclick="">Auxotroph (L-threonine auxotroph)</a> (IMG_PIPELINE; 2017-04-19)</td>
    </tr>
    <tr class='img' >
      <th class='subhead' align='right'>Metabolism</th>
      <td class='img'   align='left'><a href='main.cgi?section=TaxonDetail&page=taxonPhenoRuleDetail&taxon_oid=2724679019&rule_id=44'  onclick="">Auxotroph (L-valine auxotroph)</a> (IMG_PIPELINE; 2017-04-19)</td>
    </tr>
    <tr class='img' >
      <th class='subhead' align='right'>Metabolism</th>
      <td class='img'   align='left'><a href='main.cgi?section=TaxonDetail&page=taxonPhenoRuleDetail&taxon_oid=2724679019&rule_id=46'  onclick=""> (Non-selenocysteine synthesizer)</a> (IMG_PIPELINE; 2017-04-19)</td>
    </tr>
    <tr class='img' >
      <th class='subhead' align='right'>Metabolism</th>
      <td class='img'   align='left'><a href='main.cgi?section=TaxonDetail&page=taxonPhenoRuleDetail&taxon_oid=2724679019&rule_id=48'  onclick=""> (Non-biotin synthesizer)</a> (IMG_PIPELINE; 2017-04-19)</td>
    </tr>
    <tr class='img' >
      <th class='subhead' align='right'>Metabolism</th>
      <td class='img'   align='left'><a href='main.cgi?section=TaxonDetail&page=taxonPhenoRuleDetail&taxon_oid=2724679019&rule_id=50'  onclick="">Auxotroph (Incomplete Coenyzme A biosynthesis)</a> (IMG_PIPELINE; 2017-04-19)</td>
    </tr>
    <tr class='img' >
      <th class='subhead' align='right'>Metabolism</th>
      <td class='img'   align='left'><a href='main.cgi?section=TaxonDetail&page=taxonPhenoRuleDetail&taxon_oid=2724679019&rule_id=55'  onclick=""> (Acetyl-CoA assimilation)</a> (IMG_PIPELINE; 2017-04-19)</td>
    </tr>
    </tr>
    </table>
    <p></p><a name='statistics' href='#'><h2>Genome Statistics</h2> </a><div id='hint'>
    <img src='https://img.jgi.doe.gov/m/images/hint.gif' width='67' height='32' alt='Hint' /><p>
    To view rows that are zero,
                  go to <a href='main.cgi?section=MyIMG&page=preferences'>
                  MyIMG preferences</a> <br/>and set
                  <b>"Hide Zeroes in Genome Statistics"</b>
                  to <b>"No"</b>.</p>
    </div>
    <div class='clear'></div>
    
    <br />
            <div id='ani_parent' style='width:1200px'>
            <div id='ani_left'>
            <table class='img'  border='0' cellspacing='3' cellpadding='0' >
    <th class='img' ></th>
    <th class='img' >Number</th>
    <th class='img' >% of Total</th>
    <tr class='highlight'>
    <th class='subhead'><b>DNA, total number of bases</b></th>
    <td class='img'   align='right'>8638903</td>
    <td class='img'   align='right'>100.00%</td>
    </tr>
    <tr class='img' >
    <td class='img' >&nbsp; &nbsp; &nbsp; &nbsp; DNA coding number of bases</td>
    <td class='img'  align='right'>7563853</td>
    <td class='img'   align='right'>87.56%</td>
    </tr>
    <tr class='img' >
    <td class='img' >&nbsp; &nbsp; &nbsp; &nbsp; DNA G+C number of bases</td>
    <td class='img'   align='right'>6231516</td>
    <td class='img'   align='right'>72.13% <sup>1</sup></td>
    </tr>
    <tr class='img' >
    <td class='img' >&nbsp; &nbsp; &nbsp; &nbsp; </td>
    <td class='img' >&nbsp; &nbsp; &nbsp; &nbsp; </td>
    <td class='img' >&nbsp; &nbsp; &nbsp; &nbsp; </td>
    </tr>
    <tr class='highlight'>
    <th class='subhead'>DNA scaffolds</th>
    <td class='img'   align='right'><a href='main.cgi?section=TaxonDetail&page=scaffolds&taxon_oid=2724679019'  onclick="">12</a></td>
    <td class='img'   align='right'>100.00%</td>
    </tr>
    <tr class='img' >
    <td class='img' >&nbsp; &nbsp; &nbsp; &nbsp; </td>
    <td class='img' >&nbsp; &nbsp; &nbsp; &nbsp; </td>
    <td class='img' >&nbsp; &nbsp; &nbsp; &nbsp; </td>
    </tr>
    <tr class='highlight'>
    <th class='subhead'>Genes total number</th>
    <td class='img'   align='right'>7568</td>
    <td class='img'   align='right'>100.00%</td>
    </tr>
    <tr class='img' >
    <td class='img' >&nbsp; &nbsp; &nbsp; &nbsp; Protein coding genes</td>
    <td class='img'   align='right'><a href='main.cgi?section=TaxonDetail&page=proteinCodingGenes&taxon_oid=2724679019'  onclick="">7460</a></td>
    <td class='img'   align='right'>98.57%</td>
    </tr>
    <tr class='img' >
    <td class='img' >&nbsp; &nbsp; &nbsp; &nbsp; RNA genes</td>
    <td class='img'   align='right'><a href='main.cgi?section=TaxonDetail&page=rnas&taxon_oid=2724679019'  onclick="">108</a></td>
    <td class='img'   align='right'>1.43%</td>
    </tr>
    <tr class='img' >
    <td class='img' >&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; rRNA genes</td>
    <td class='img'   align='right'><a href='main.cgi?section=TaxonDetail&page=rnas&taxon_oid=2724679019&locus_type=rRNA'  onclick="">7</a></td>
    <td class='img'   align='right'>0.09%</td>
    </tr>
    <tr class='img' >
    <td class='img' >&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 5S rRNA</td>
    <td class='img'   align='right'><a href='main.cgi?section=TaxonDetail&page=rnas&taxon_oid=2724679019&locus_type=rRNA&gene_symbol=5S'  onclick="">2</a></td>
    <td class='img'   align='right'>0.03%</td>
    </tr>
    <tr class='img' >
    <td class='img' >&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 16S rRNA</td>
    <td class='img'   align='right'><a href='main.cgi?section=TaxonDetail&page=rnas&taxon_oid=2724679019&locus_type=rRNA&gene_symbol=16S'  onclick="">3</a></td>
    <td class='img'   align='right'>0.04%</td>
    </tr>
    <tr class='img' >
    <td class='img' >&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 23S rRNA</td>
    <td class='img'   align='right'><a href='main.cgi?section=TaxonDetail&page=rnas&taxon_oid=2724679019&locus_type=rRNA&gene_symbol=23S'  onclick="">2</a></td>
    <td class='img'   align='right'>0.03%</td>
    </tr>
    <tr class='img' >
    <td class='img' >&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; tRNA genes</td>
    <td class='img'   align='right'><a href='main.cgi?section=TaxonDetail&page=rnas&taxon_oid=2724679019&locus_type=tRNA'  onclick="">69</a></td>
    <td class='img'   align='right'>0.91%</td>
    </tr>
    <tr class='img' >
    <td class='img' >&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Other RNA genes</td>
    <td class='img'   align='right'><a href='main.cgi?section=TaxonDetail&page=rnas&taxon_oid=2724679019&locus_type=xRNA'  onclick="">32</a></td>
    <td class='img'   align='right'>0.42%</td>
    </tr>
    <tr class='img' >
    <td class='img' >&nbsp; &nbsp; &nbsp; &nbsp; Protein coding genes with function prediction</td>
    <td class='img'   align='right'><a href='main.cgi?section=TaxonDetail&page=withFunc&taxon_oid=2724679019'  onclick="">5396</a></td>
    <td class='img'   align='right'>71.30%</td>
    </tr>
    <tr class='img' >
    <td class='img' >&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; without function prediction</td>
    <td class='img' align='right'><a href='main.cgi?section=TaxonDetail&page=withoutFunc&taxon_oid=2724679019'  onclick="">2064</a></td>
    <td class='img' align='right'>27.27%</td>
    </tr>
    <tr class='img' >
    <td class='img' >&nbsp; &nbsp; &nbsp; &nbsp; Protein coding genes with enzymes</td>
    <td class='img'   align='right'><a href='main.cgi?section=TaxonDetail&page=enzymes&taxon_oid=2724679019'  onclick="">1428</a></td>
    <td class='img'   align='right'>18.87%</td>
    </tr>
    <tr class='img' >
    <td class='img' >&nbsp; &nbsp; &nbsp; &nbsp; w/o enzymes but with candidate KO based enzymes</td>
    <td class='img'   align='right'><a href='main.cgi?section=MissingGenes&page=taxonGenesWithKO&taxon_oid=2724679019'  onclick="">83</a></td>
    <td class='img'   align='right'>1.10%</td>
    </tr>
    <tr class='img' >
    <td class='img' >&nbsp; &nbsp; &nbsp; &nbsp; Protein coding genes connected to KEGG pathways<sup>3</sup></td>
    <td class='img'   align='right'><a href='main.cgi?section=TaxonDetail&page=kegg&cat=cat&taxon_oid=2724679019'  onclick="">1458</a></td>
    <td class='img'   align='right'>19.27%</td>
    </tr>
    <tr class='img' >
    <td class='img' >&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; not connected to KEGG pathways</td>
    <td class='img'   align='right'><a href='main.cgi?section=TaxonDetail&page=noKegg&taxon_oid=2724679019'  onclick="">6002</a></td>
    <td class='img'   align='right'>79.31%</td>
    </tr>
    <tr class='img' >
    <td class='img' >&nbsp; &nbsp; &nbsp; &nbsp; Protein coding genes connected to KEGG Orthology (KO)</td>
    <td class='img'   align='right'><a href='main.cgi?section=TaxonDetail&page=ko&taxon_oid=2724679019'  onclick="">2421</a></td>
    <td class='img'   align='right'>31.99%</td>
    </tr>
    <tr class='img' >
    <td class='img' >&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; not connected to KEGG Orthology (KO)</td>
    <td class='img'   align='right'><a href='main.cgi?section=TaxonDetail&page=noKo&taxon_oid=2724679019'  onclick="">5039</a></td>
    <td class='img'   align='right'>66.58%</td>
    </tr>
    <tr class='img' >
    <td class='img' >&nbsp; &nbsp; &nbsp; &nbsp; Protein coding genes connected to MetaCyc pathways</td>
    <td class='img'   align='right'><a href='main.cgi?section=TaxonDetail&page=metacyc&taxon_oid=2724679019'  onclick="">1251</a></td>
    <td class='img'   align='right'>16.53%</td>
    </tr>
    <tr class='img' >
    <td class='img' >&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; not connected to MetaCyc pathways</td>
    <td class='img'   align='right'><a href='main.cgi?section=TaxonDetail&page=noMetacyc&taxon_oid=2724679019'  onclick="">6209</a></td>
    <td class='img'   align='right'>82.04%</td>
    </tr>
    <tr class='img' >
    <td class='img' >&nbsp; &nbsp; &nbsp; &nbsp; Protein coding genes with COGs<sup>3</sup></td>
    <td class='img'   align='right'><a href='main.cgi?section=TaxonDetail&page=cogs&cat=cat&taxon_oid=2724679019'  onclick="">4284</a></td>
    <td class='img'   align='right'>56.61%</td>
    </tr>
    <tr class='img' >
    <td class='img' >&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; with KOGs<sup>3</sup></td>
    <td class='img'   align='right'><a href='main.cgi?section=TaxonDetail&page=kogs&cat=cat&taxon_oid=2724679019'  onclick="">1373</a></td>
    <td class='img'   align='right'>18.14%</td>
    </tr>
    <tr class='img' >
    <td class='img' >&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; with Pfam<sup>3</sup></td>
    <td class='img'   align='right'><a href='main.cgi?section=TaxonDetail&page=pfam&cat=cat&taxon_oid=2724679019'  onclick="">5643</a></td>
    <td class='img'   align='right'>74.56%</td>
    </tr>
    <tr class='img' >
    <td class='img' >&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; with TIGRfam<sup>3</sup></td>
    <td class='img'   align='right'><a href='main.cgi?section=TaxonDetail&page=tigrfam&cat=cat&taxon_oid=2724679019'  onclick="">1472</a></td>
    <td class='img'   align='right'>19.45%</td>
    </tr>
    <tr class='img' >
    <td class='img' >&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; with InterPro</td>
    <td class='img'   align='right'><a href='main.cgi?section=TaxonDetail&page=ipr&taxon_oid=2724679019'  onclick="">3963</a></td>
    <td class='img'   align='right'>52.37%</td>
    </tr>
    <tr class='img' >
    <td class='img' >&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; with IMG Terms</td>
    <td class='img'   align='right'><a href='main.cgi?section=TaxonDetail&page=imgTerms&taxon_oid=2724679019'  onclick="">928</a></td>
    <td class='img'   align='right'>12.26%</td>
    </tr>
    <tr class='img' >
    <td class='img' >&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; with IMG Pathways</td>
    <td class='img'   align='right'><a href='main.cgi?section=TaxonDetail&page=imgPways&taxon_oid=2724679019'  onclick="">311</a></td>
    <td class='img'   align='right'>4.11%</td>
    </tr>
    <tr class='img' >
    <td class='img' >&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; with IMG Parts List</td>
    <td class='img'   align='right'><a href='main.cgi?section=TaxonDetail&page=imgPlist&taxon_oid=2724679019'  onclick="">423</a></td>
    <td class='img'   align='right'>5.59%</td>
    </tr>
    <tr class='img' >
    <td class='img' >&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; in internal clusters</td>
    <td class='img'   align='right'><a href='main.cgi?section=TaxonDetail&page=paralogGroups&taxon_oid=2724679019'  onclick="">2718</a></td>
    <td class='img'   align='right'>35.91%</td>
    </tr>
    <tr class='img'>
    <td class='img'> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  in Chromosomal Cassette</th>
    <td class='img'   align='right'> <a href='main.cgi?section=TaxonDetail&page=geneCassette&taxon_oid=2724679019'  onclick="">7366</a> </td>
    <td class='img'   align='right'> 97.33% </td>
    </tr>
    <tr class='img'>
    <td class='img'> &nbsp; &nbsp; &nbsp; &nbsp;  Chromosomal Cassettes</th>
    <td class='img'   align='right'> <a href='main.cgi?section=GeneCassette&page=occurrence&taxon_oid=2724679019'  onclick="">783</a> </td>
    <td class='img'   align='right'>-</td>
    </tr>
    <tr class='img'>
    <td class='img'> &nbsp; &nbsp; &nbsp; &nbsp;  Biosynthetic Gene Clusters</th>
    <td class='img' align='right'> <a href='main.cgi?section=BiosyntheticDetail&page=biosynthetic_clusters&taxon_oid=2724679019'  onclick="">47</a> </td>
    <td class='img' align='right'>-</td>
    </tr>
    <tr class='img'>
    <td class='img'> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  Genes in Biosynthetic Clusters</th>
    <td class='img' align='right'> <a href='main.cgi?section=BiosyntheticDetail&page=biosynthetic_genes&taxon_oid=2724679019'  onclick="">1637</a> </td>
    <td class='img' align='right'> 21.63% </td>
    </tr>
    <tr class='img' >
    <td class='img' >&nbsp; &nbsp; &nbsp; &nbsp; Fused Protein coding genes</td>
    <td class='img'   align='right'><a href='main.cgi?section=TaxonDetail&page=fusedGenes&taxon_oid=2724679019'  onclick="">492</a></td>
    <td class='img'   align='right'>6.50%</td>
    </tr>
    <tr class='img' >
    <td class='img' >&nbsp; &nbsp; &nbsp; &nbsp; Protein coding genes coding signal peptides</td>
    <td class='img'   align='right'><a href='main.cgi?section=TaxonDetail&page=signalpGeneList&taxon_oid=2724679019'  onclick="">535</a></td>
    <td class='img'   align='right'>7.07%</td>
    </tr>
    <tr class='img' >
    <td class='img' >&nbsp; &nbsp; &nbsp; &nbsp; Protein coding genes coding transmembrane proteins</td>
    <td class='img'   align='right'><a href='main.cgi?section=TaxonDetail&page=transmembraneGeneList&taxon_oid=2724679019'  onclick="">1736</a></td>
    <td class='img'   align='right'>22.94%</td>
    </tr>
    <tr class='highlight'>
    <th class='subhead'>COG clusters</th>
    <td class='img'   align='right'>1634</td>
    <td class='img'   align='right'>38.14%</td>
    </tr>
    <tr class='highlight'>
    <th class='subhead'>KOG clusters</th>
    <td class='img'   align='right'>578</td>
    <td class='img'   align='right'>13.49%</td>
    </tr>
    <tr class='highlight'>
    <th class='subhead'>Pfam clusters</th>
    <td class='img'   align='right'>2246</td>
    <td class='img'   align='right'>39.80%</td>
    </tr>
    <tr class='highlight'>
    <th class='subhead'>TIGRfam clusters</th>
    <td class='img'   align='right'>1043</td>
    <td class='img'   align='right'>70.86%</td>
    </tr>
    </table>
    <br/>
    <b>Notes</b>:<br/>
    <p>
    <a name='ref1' id='ref1'></a>1 - GC percentage shown as count of G's and C's divided by the total number of bases.<br/> The total number of bases is not necessarily synonymous with a total number of G's, C's, A's, and T's.<br/>
    <a name='ref2' id='ref2'></a>2 - Pseudogenes may also be counted as protein coding or RNA genes, so is not additive under total gene count.<br/>
    <a name='ref3' id='ref3'></a>3 - Graphical view available.<br/>
    </p>
    
                    </div>
                    <div id='ani_right' style='max-width: 600px'>
                <b>Average Nucleotide Identity (ANI)</b><p><u>Species</u>: Streptomyces sp.<br/>Total genomes of this same species: <a href='main.cgi?section=ANI&page=genomesForGenusSpecies&genus_species=Streptomyces sp.&domain=B'  onclick="">406</a><br/>This species is present in <u><a href='main.cgi?section=ANI&page=cliquesForGenusSpecies&genus_species=Streptomyces sp.'  onclick="">228</a></u> cliques<div id='hint'>
    <img src='https://img.jgi.doe.gov/m/images/hint.gif' width='67' height='32' alt='Hint' /><p>
    Click on a cluster ID to view genomes in that clique, as well as a list of similar cliques.</p>
    </div>
    <div class='clear'></div>
    </p>
       <link rel="stylesheet" type="text/css"
           href="/../yui282/yui/build/datatable/assets/skins/sam/datatable.css" />
       
           <style>
           .yui-skin-sam .yui-dt th .yui-dt-liner {
               white-space: inherit;
           }
           </style>
           <div class='yui-dt' style='padding:5px 0'>
           <table style='font-size:12px'>
       
            <th >
             <div class='yui-dt-liner'>
            <span >Cluster ID</span>
            </div>
        </th>
          
            <th >
             <div class='yui-dt-liner'>
            <span >Cluster Type</span>
            </div>
        </th>
          
            <th style='width:200px;'>
             <div class='yui-dt-liner'>
            <span >Contributing Species</span>
            </div>
        </th>
          
            <th >
             <div class='yui-dt-liner'>
            <span >Genome Count</span>
            </div>
        </th>
          <tr class='yui-dt-first yui-dt-even' >
    <td class='yui-dt-first yui-dt-even' style='text-align:right;'>
    <div class='yui-dt-liner' style=''><a href='main.cgi?section=ANI&page=cliqueDetails&clique_id=10986'  onclick="">10986</a></div>
    </td>
    <td class='yui-dt-first yui-dt-even' style='text-align:center;'>
    <div class='yui-dt-liner' style=''>singleton</div>
    </td>
    <td class='yui-dt-first yui-dt-even' style='text-align:left;'>
    <div class='yui-dt-liner' style=''>Streptomyces sp.</div>
    </td>
    <td class='yui-dt-first yui-dt-even' style='text-align:right;'>
    <div class='yui-dt-liner' style=''><a href='main.cgi?section=ANI&page=genomesForClique&clique_id=10986'  onclick="">1</a></div>
    </td>
    </tr>
    </table>
    </div>
    
                    </div>
                    <div id="myclear"></div>
                    </div>
                
    <p></p><a name='browse' href='#'> </a><p></p><a name='' href='#'><h2>Browse Genome</h2> </a>
    <input type='button' class='lgbutton' value='Scaffolds and Contigs'  onClick='javascript:window.open("main.cgi?section=TaxonDetail&page=scaffolds&taxon_oid=2724679019&pidt=83454.", "_self");' /><br/>
    <input type='button' class='lgbutton' value='Chromosome Maps'  onClick='javascript:window.open("main.cgi?section=TaxonCircMaps&page=circMaps&taxon_oid=2724679019&pidt=83454.", "_self");' /><br/>
    <input type='button' class='lgbutton' value='Create Artemis Data File'  onClick='javascript:window.open("main.cgi?section=Artemis&page=form&taxon_oid=2724679019&pidt=83454.", "_self");' /><p></p><a name='genes' href='#'> </a><p></p><a name='bin' href='#'><h2>Phylogenetic Distribution of Genes</h2> </a><p>
    
                <input type='button' class='lgbutton'
                value='Distribution by BLAST percent identities'
                onclick="window.location.href='main.cgi?section=MetagenomeHits&page=metagenomeStats&taxon_oid=2724679019'"
                title='Distribution of genes binned by BLAST percent identities'
                />
            </p>
    <p></p><a name='hort' href='#'><h2>Putative Horizontally Transferred Genes</h2> </a>
                <p>
                <input type='button' class='lgbutton'
                value='Putative Horizontally Transferred'
                onclick="window.location.href='main.cgi?section=TaxonDetail&page=horTransferred&taxon_oid=2724679019'"
                />
                </p>
           <p></p><a name='compare' href='#'><h2>Compare Gene Annotations</h2> </a>
    <div class='lgbutton'>
    <a href='main.cgi?section=GeneAnnotPager&page=viewGeneAnnotations&taxon_oid=2724679019'  onclick="">Compare Gene Annotations</a></div>
    <p>
    Gene annotation values are precomputed and stored in a tab delimited file<br/>also viewable in Excel.<br/>
    </p>
    <p></p><a name='ani' href='#'><h2>Average Nucleotide Identity</h2> </a><div class='lgbutton'>
    <a href='main.cgi?section=ANI&page=infoForGenome&taxon_oid=2724679019'  onclick="">Average Nucleotide Identity</a></div>
    <p></p><a name='kmer' href='#'><h2>Scaffold Consistency Check</h2> </a>
    <div class='lgbutton'>
    <a href='main.cgi?section=Kmer&page=plot&taxon_oid=2724679019'  onclick="">Kmer Frequency Analysis</a></div>
    <p></p><a name='information' href='#'><h2>Scaffold Search</h2> </a><p>
    Scaffold search allows for seaching for all scaffolds within an organism or microbiome.<br/>
    Please enter a search term or matching substring for scaffold name or read ID.<br/>
    </p>
    <select name='scaffoldSearchType'>
    <option value='scaffold_name'>Scaffold Name</option>
    <option value='read_id'>Read ID&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; </option>
    </select>
    <input type='text' name='scaffoldSearchTerm' size='40' />
    <br/>
    <p>
    or enter low and high range for<br/>
    </p>
    <input type='hidden' id='taxon_oid' name='taxon_oid' value='2724679019' />
    <select name='rangeType'>
    <option value='seq_length'>Sequence Length&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; </option>
    <option value='gc_percent'>GC (0.00-1.00)</option>
    <option value='read_depth'>Read Depth</option>
    </select>
    <input type='text' name='loRange' size='10' /> -<input type='text' name='hiRange' size='10' />
    <br/>
    <input type="submit" name="_section_TaxonDetail_searchScaffolds" value="Go" class="smdefbutton" />&nbsp; <input type="reset"  name=".reset" class="smbutton" />
            <script language='javascript' type='text/javascript'>
                var e0 = document.getElementById( "loading" );
                if(e0 != null) {
                    e0.innerHTML = "Loaded.";
                }
            </script>
            </form>
        </div> <!-- end of content div  -->
            <div id="myclear"></div>
        
        </div> <!-- end of container div  -->
        <br>
    <br>
    
    <link rel="stylesheet" href="/css/footer-v50.css" /> 
    
    
    <div class="divider1"></div>
    
    <div class="flex-footer" id="jgi-tools-footer">
    
      <!--start of 4 part section-->
      <div class="tools-link">
        <div class="system-bullet">
          <a target="_self" href="https://gold.jgi.doe.gov/" class="textlink">Genomes OnLine Database (GOLD)</a> - a resource for sequencing projects and associated metadata.
        </div>
      </div>
      <div class="tools-link">
        <div class="system-bullet">
          <a target="_self" href="https://genome.jgi.doe.gov" class="textlink">JGI Genome Portal</a> - unified access to all JGI genomic datasets.
        </div>
      </div>
      <div class="tools-link">
        <div class="system-bullet">
          <a target="_self" href="https://genome.jgi.doe.gov/programs/fungi/index.jsf" class="textlink">Mycocosm</a> - access to data, visualization, and analysis tools for comparative genomics of fungi.
        </div>
      </div>
      <div class="tools-link">
        <div class="system-bullet">
          <a target="_self" href="http://phytozome.jgi.doe.gov" class="textlink">Phytozome</a> - a hub for accessing, visualizing and analyzing plant genomes.
        </div>
      </div>
      
      <!--end of 4 part section-->
      <div class="clear"></div>
      
    </div>
    
    <footer id="jgi-img-footer">
      <div class="home-left">
        <ul>
          <li>
        <a href="main.cgi?section=Questions" style="color:black;">Contact Us</a>
        <a href="http://jgi.doe.gov/disclaimer/" style="color:black; padding-left:10px;">Disclaimer</a>
        <br>
        <a href="http://jgi.doe.gov/accessibility-section-508-statement/" style="color:black;">Accessibility/Section 508</a>
        <br>&copy;1997-2019 The Regents of the University of California<br>
        <span style="font-size:9px;">Version 5.1 Sep. 2019 <br> jgi-img-web-1  gemini1_shared 5.016000 2020-02-19-09.48.43
    </span>
          </li>
        </ul>
      </div>      
      <div class="home-middle">
        <ul>
          <li>
        <a href="https://groups.google.com/a/lbl.gov/forum/?hl=en&amp;fromgroups#!forum/img-user-forum">
          <img src="/images/img-user-forum.png" style="width:24px;height:24px;" alt="IMG User Forum"></a>
        <a href="https://groups.google.com/a/lbl.gov/forum/?hl=en&amp;fromgroups#!forum/img-user-forum">IMG User Forum</a>
        <br>Where users can view documents, FAQ and ask questions.
          </li>
        </ul>
      </div>
      <div class="home-right">
        <ul>
          <li>
        <a href="http://science.energy.gov/">
          <img alt="DOE logo" name="doe_sc_logo" src="/images/DOE_logo.png">
        </a>
          </li>
        </ul>
      </div>
      <div class="clear"></div>
    </footer>
    
    
    
    <script type='text/javascript'>
        var e0 = document.getElementById( "loading" );
        if(e0 == null || e0 == undefined ) {
         // do nothing for now
        } else {
            var oldHTML = e0.innerHTML;
            if(oldHTML.indexOf("ajax-loader") != -1) {
                e0.innerHTML = " loaded. ";
            }
        }
    </script>    
    
    <script  type="text/javascript">
            messageFile('xml.cgi?section=MessageFile');
    </script>
    
    `;
    /* tslint:enable */
}

describe('parse_JGITaxonDetail_page()', () => {
    let page: string;

    beforeAll(() => {
        page = sample_JGI_genome_page();
    });

    describe('Genome with JGI identifier', () => {
        it('should return an enrichment', () => {
            const result = parse_JGITaxonDetail_page(page);

            const expected = {
              url: 'https://img.jgi.doe.gov/cgi-bin/m/main.cgi?section=TaxonDetail&page=taxonDetail&taxon_oid=2724679019',
              title: 'Streptomyces sp. MBT76 genome sequencing',
              species: {
                tax_id: 1488406,
                scientific_name: 'Streptomyces sp. MBT76'
              }
            };
            expect(result).toEqual(expected);
        });
    });
});
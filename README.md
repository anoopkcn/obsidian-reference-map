# Reference Map
Reference and citation map for literature review and discovery. 

## Requirements
- [Obsidian](https://obsidian.md/) with community plugins enabled

## Installation
The plugin is not available in the community plugin section in Obsidian. So you have to install it manually.

### Manual Installation
1. Download the latest release from [here](https://github.com/anoopkcn/obsidian-reference-map/releases) and unzip it.
2. Copy the `obsidian-reference-map` folder to your vault's `.obsidian/plugins` folder.
3. Reload Obsidian.
4. Enable the plugin in the community plugins section.

You can also use the [BRAT](https://github.com/TfTHacker/obsidian42-brat/) plugin to install the latest release.

## Features
- [x] Identifies research literature ID's from the current document and displays a map of references and citations. 
- [x] Copy metadata and bibtex to the clipboard.
- [x] Open PDF if available
- [x] Open paper in [semanticscholar](https://www.semanticscholar.org/)
- [x] Open author's details in [semanticscholar](https://www.semanticscholar.org/)
- [x] List citations
- [x] List references
- [x] Search references and Citations list
- [ ] Sorting of references and citations
- [ ] Get references via title of the paper
- [ ] Get references via author's name

**NOTE**:Papers are ordered according to the publish date.

![obsidian-reference-map-demo](./images/obsidian-reference-map.png)

## Usage
- Click on the title of the paper to open the paper in [semanticscholar](https://www.semanticscholar.org/)
- Click on the author's name to open author's details in [semanticscholar](https://www.semanticscholar.org/)
- Button functions:

    (1) Copy `bibtex` to the clipboard

    (2) Copy the `title`, `authors`, `year` and `abstract` to the clipboard

    (3) Click to open PDF if [Open Access](https://de.wikipedia.org/wiki/Open_Access) PDF is present for a reference

    (4) Click to open a list of all cited papers (References)

    (5) Click to open a list of all citing papers (Citations)

### Configuration 
    
Check out the settings tab to configure the plugin behaviour.

If you want to configure the style of the view you can use [obsidian-style-settings](https://github.com/mgmeyers/obsidian-style-settings) plugin.

![orm-ref-cite](./images/orm-references-citations.png)

## Paper ID's can be the following:
The following types of IDs are supported:
- `CorpusId:<id>` - Semantic Scholar numerical ID, e.g. `215416146`
- `DOI:<doi>` - a [Digital Object Identifier](http://doi.org/), e.g. `DOI:10.18653/v1/N18-3011`
- `ARXIV:<id>` - [arXiv.rg](https://arxiv.org/), e.g. `ARXIV:2106.15928`
- `MAG:<id>` - Microsoft Academic Graph, e.g. `MAG:112218234`
- `PMID:<id>` - PubMed/Medline, e.g. `PMID:19872477`
- `PMCID:<id>` - PubMed Central, e.g. `PMCID:2323736`
- `URL:<url>` - URL from sites, e.g. `URL:https://arxiv.org/abs/2106.15928v1`
<!-- - `ACL:<id>` - Association for Computational Linguistics, e.g. `ACL:W12-3903` -->


[![MIT license](https://img.shields.io/github/license/anoopkcn/obsidian-reference-map)](LICENSE) [![Downloads](https://img.shields.io/github/downloads/anoopkcn/obsidian-reference-map/total?color=purple)](https://github.com/anoopkcn/obsidian-reference-map/releases) [![GitHub version](https://img.shields.io/github/manifest-json/v/anoopkcn/obsidian-reference-map)](https://github.com/anoopkcn/obsidian-reference-map/releases) [![Build Status](https://img.shields.io/github/actions/workflow/status/anoopkcn/obsidian-reference-map/release.yml)](https://github.com/anoopkcn/obsidian-reference-map/actions) ![Release Date](https://img.shields.io/github/release-date/anoopkcn/obsidian-reference-map?color=blue)

![ORM-Header-logo](./images/reference-map.png)

# Reference Map

Reference Map is a plugin for [Obsidian](https://obsidian.md/) that helps you to manage and discover your references and citations. It provides a sidebar view to manage cited and citing references of your bibliography. It can be used to create a reference map for a paper or a project.

**More information is available on the [Wiki](https://github.com/anoopkcn/obsidian-reference-map/wiki) page.**

## Requirements

-   [Obsidian](https://obsidian.md/) with community plugins enabled

## Installation

### Community Plugin Installation

The plugin is available in the Obsidian's Community Plugin Tab via: Settings → Community Plugins → Browse → Search for "Reference Map"

### Manual Installation

1. Download the latest release from [here](https://github.com/anoopkcn/obsidian-reference-map/releases) and unzip it.
2. Copy the `obsidian-reference-map` folder to your vault's `.obsidian/plugins` folder.
3. Reload Obsidian.
4. Enable the plugin in the community plugins section.

You can also use the [BRAT](https://github.com/TfTHacker/obsidian42-brat/) plugin to install the latest release.

## Usage

This `README.md` file contains the basic description of the plugin for a detailed guide please **refer to the [Wiki](https://github.com/anoopkcn/obsidian-reference-map/wiki) page**.

Main features:

- **Reference Map Search** - Search for references online to create or insert details.
- **Reference Map View** - View details of your references in the current document.

### Reference Map Search

![ORm-search-demo](./images/orm-search-create-demo.png)

Search for references and citations online to create or insert details. You  can locate  the commands by opening the Obsidian command palette (Ctrl/Cmd + P) and typing `Reference Map`. By default no hotkeys are se for the commands, but you can easily add them in the Hotkeys tab.

If you select a text in the current document and then issue the command the selected text will be used as the search query.

| Command | Description | Hotkey |
| --- | --- | --- |     
| Reference Map: Search and Insert | Search for references online to insert details in the current document. | - |
| Reference Map: Search and Create | Search for references online to create a new markdown file using the details | - |

You can configure the template for both commands in the settings tab.

### Reference Map View

![ORM-demo](./images/orm-demo-0.7.5.png)

Reference Map View contains Index cards and Reference Cards.

**Index Cards** are detected from the markdown document using ID's(see the _Static Reference List_ section below)

**Reference Cards** show a searchable and sortable list of cited and citing papers of a reference contained in the index card.

Each Index/Reference card in the view will show the following information:

| Button | Section                    | Description                                                                                                                                                                    | On Click                                                                                                            |
| ------ | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| text   | Title                      | Title of the paper                                                                                                                                                             | Open the paper in [Semantic Scholar](https://www.semanticscholar.org/)                                              |
|        | Abstract                   | Abstract of the paper (Default=OFF)                                                                                                                                            | -                                                                                                                   |
| text   | Authors                    | Authors of the paper                                                                                                                                                           | Open the author's details in [Semantic Scholar](https://www.semanticscholar.org/)                                   |
|        | Year                       | Year of publication                                                                                                                                                            | -                                                                                                                   |
| text   | citekey                    | Pandoc citekey (Default=OFF)                                                                                                                                                   | Open reference in the Zotero Library                                                                                |
| (1)    | Metadata copy              | User defined format of metadata. Default=`bibtex` of the paper                                                                                                                 | Copy the `<bibtex>` to the clipboard (If Batch copy is enabled it will copy `<bibtex>` for all the cited paper)     |
| (2)    | Metadata copy              | User defined format of metadata Default=Formatted `metadata` details                                                                                                           | Copy the `<metadata>` to the clipboard (If Batch copy is enabled it will copy `<metadata>` for all the cited paper) |
| (3)    | Metadata copy              | User defined format of metadata. Default=Reference title as `wikilink` (Default=OFF)                                                                                           | Copy the `<wikilink>` to the clipboard (If Batch copy is enabled it will copy `<wikilink>` for all the cited paper) |
| (4)    | PDF                        | Open Access PDF of the paper                                                                                                                                                   | Open the [Open Access](https://de.wikipedia.org/wiki/Open_Access) PDF of the paper if it is present for a reference |
| (5)    | Reference count            | Number of references                                                                                                                                                           | Open a searchable list of all cited papers (References)                                                             |
| (6)    | Citation count             | Number of citations                                                                                                                                                            | Open a searchable list of all citing papers (Citations)                                                             |
|        | Influential citation count | [Number of influential citations](https://www.semanticscholar.org/paper/Identifying-Meaningful-Citations-Valenzuela-Ha/1c7be3fc28296a97607d426f9168ad4836407e4b) (Default=OFF) | -                                                                                                                   |

_You can customize the content of metadata buttons(1,2,3) according to your workflow, possible variables for the metadata template for the buttons copy/create contents are listed in the settings tab_

_Batch operations are exclusive to Index Cards_

![ORM-ref-cite](./images/orm-list-demo.png)

### Static Reference List

Reference IDs (DOI, arxiv, corpusID, URL, citeKey, etc,.) that are found in the current document are listed in the `Reference Map` view. Valid IDs can be added anywhere in the document and they will be detected.

The following types of IDs are supported:

| ID Syntax       | Description                                              | Example                                                |
| --------------- | -------------------------------------------------------- | ------------------------------------------------------ |
| `DOI:<doi>`     | A [Digital Object Identifier](http://doi.org/).          | `DOI:10.18653/v1/N18-3011` or `10.18653/v1/N18-3011v1` |
| `@<citekey>`    | [Zotero](https://www.zotero.org/) citekey(Default=OFF)\* | `@smith2019attention`                                  |
| `ARXIV:<id>`    | [arXiv.org](https://arxiv.org/)                          | `ARXIV:2106.15928`                                     |
| `MAG:<id>`      | Microsoft Academic Graph                                 | `MAG:112218234`                                        |
| `PMID:<id>`     | PubMed/Medline                                           | `PMID:19872477`                                        |
| `PMCID:<id>`    | PubMed Central                                           | `PMCID:2323736`                                        |
| `URL:<url>`     | URL from sites                                           | `URL:https://arxiv.org/abs/2003.05991`                 |
| `CorpusId:<id>` | Semantic Scholar numerical ID                            | `CorpusId:215416146`                                   |

\*To enable CiteKey support(for Zotero or for other reference managers), one has to provide a `Bibtex CSL JSON`(Better BibTex Zotero Plugin feature, auto updates with changes in the library) or `CSL JSON`(Generic CSL library from any reference manager) file or `BibTeX` file with `.bib` extension. Once enabled in the settings, the plugin can recognize the Pandoc citation format.

**Note**: CiteKey's should NOT contain `spaces`, `[`, `(` or `*`. Also make sure in Zotero library DOI field contains a valid ID.

For Static Reference List, selecting the ID in the markdown file will highlight the corresponding card in the Reference Map view.

### Dynamic Reference List

The Reference Map view can also be configured to show a list of references that correspond to the filename of the note or frontmatter keywords.
_Check out the settings tab to configure the plugin behaviour_

**Example:** For a file named `Attention is all you need.md` cards will be displayed for references that match `Attention+all+need`.

For frontmatter keywords, you can configure a keyword to be used for reference search. By default, the keyword is `keywords`.

**Example:** For a frontmatter given as follows:

```
---
keywords: autoencoders, machine learning
---
```

Cards will be displayed for references that match `autoencoders+machine+learning`.

Note that since new references are added to the database regularly the dynamic list might not stay the same each time you open the file. Especially for generic keywords like `machine learning`, `deep learning`, `history` etc.

**This feature can be used for keeping up to date with the latest research in a specific field as well**

## Configuration

If you want to configure the style of the view you can use the [Obsidian-style-settings](https://github.com/mgmeyers/obsidian-style-settings) plugin.

The settings tab contains options to configure the behaviour of the plugin.

**Please feel free to open an issue if you find any bugs or have any suggestions at [GitHub Issues Page](https://github.com/anoopkcn/obsidian-reference-map/issues)**

// English
const clipBoard = `<svg
xmlns="http://www.w3.org/2000/svg"
width="16px"
height="16px"
viewBox="0 0 24 24"
fill="none"
stroke="currentColor"
stroke-width="2"
stroke-linecap="round"
stroke-linejoin="round"
>
<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
<rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
</svg>
`
const papeClip = `<svg
xmlns="http://www.w3.org/2000/svg"
width="16px"
height="16px"
viewBox="0 0 24 24"
fill="none"
stroke="currentColor"
stroke-width="2"
stroke-linecap="round"
stroke-linejoin="round"
>
<path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
</svg>
`
const clipboardData = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clipboard-data" viewBox="0 0 16 16">
<path d="M4 11a1 1 0 1 1 2 0v1a1 1 0 1 1-2 0v-1zm6-4a1 1 0 1 1 2 0v5a1 1 0 1 1-2 0V7zM7 9a1 1 0 0 1 2 0v3a1 1 0 1 1-2 0V9z"/>
<path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
<path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
</svg>`
export default {
    SEE_DOCUMENTATION: "See Documentation",
    SEE_DOCUMENTATION_DESC: "For more information regarding the plugin see the <a href='https://github.com/anoopkcn/obsidian-reference-map'>obsidian-reference-map</a> <code>README.md</code> file",
    GENERAL_SETTINGS: "General Settings",
    REFERENCE_MAP: "Reference Map",
    NO_REFERENCES_IN_FILE: "No reference ID's are found in the active document",
    REFRESH_VIEW: "Refresh Map",
    REFRESH_VIEW_DESC: "Settings changes will not affect the current view.<br>" +
        "If you prefer to apply changes also to the current view, you can press this button",
    HIDE_SHOW_ABSTRACT: "Hide or Show Additional Details",
    HIDE_SHOW_ABSTRACT_DESC: "Hide or show the abstract and all author names of a references in the respective card<br>" +
        "<b>Toggle ON:</b> Abstract and all author names will be visible <br>" +
        "<b>Toggle OFF:</b> Abstract will be hidden",
    HIDE_SHOW_BUTTONS_ON_HOVER: "Hide or Show Buttons on Hover",
    HIDE_SHOW_BUTTONS_ON_HOVER_DESC:
        "Hide or show the buttons of references on hover<br>"
        + "<b> Toggle ON: </b> Buttons will be visible on hover<br>"
        + "<b> Toggle OFF: </b> Buttons will always be visible",
    HIDE_SHOW_INFLUENTIAL_COUNT: "Hide or Show Influential Citation Count",
    HIDE_SHOW_INFLUENTIAL_COUNT_DESC:
        "Hide or show the influential citation count of references<br>"
        + "<b> Toggle ON: </b> Influential count will be visible<br>"
        + "<b> Toggle OFF: </b> Influential count will be hidden",
    SEARCH_TITLE: "Search References Using File Name",
    SEARCH_TITLE_DESC: "Find references also using the markdown note file name in addition to reference IDs<br>" +
        "<b>Toggle ON:</b> Search using file name is enabled<br>" +
        "<b>Toggle OFF:</b> Search using file name disabled",
    SEARCH_LIMIT: "Search References Limit",
    SEARCH_LIMIT_DESC: "Limit of the number of references shown in the map when <b>Search References</b> is enabled. ",
    SEARCH_FRONT_MATTER: "Search References Using Frontmatter",
    SEARCH_FRONT_MATTER_DESC: "Find references also using the front matter of the markdown note file in addition to reference IDs<br>" +
        "<b>Toggle ON:</b> Enable search using front matter<br>" +
        "<b>Toggle OFF:</b> Disable search using front matter",
    SEARCH_FRONT_MATTER_LIMIT: "Search Frontmatter Limit",
    SEARCH_FRONT_MATTER_LIMIT_DESC: "Limit of the number of references shown in the map when <b>Search Frontmatter</b> is enabled. ",
    SEARCH_FRONT_MATTER_KEY: "Search Frontmatter Key",
    SEARCH_FRONT_MATTER_KEY_DESC: "The values of the key specified here will be used to search for references.",
    SEARCH_CITEKEY: "Get References Using Citekey",
    SEARCH_CITEKEY_DESC: "Find references also using the citekey included in the markdown file in addition to reference IDs<br>" +
        "<b>Toggle ON:</b> Enable citekey detection<br>" +
        "<b>Toggle OFF:</b> Disable citekey detection",
    SEARCH_CITEKEY_PATH: "Citekey CSL JSON file",
    SEARCH_CITEKEY_PATH_DESC: "Name of your CSL JSON file. Path must be relative to the vault root",
    CITEKEY_ZOTERO_LINK: "Hide or Show Zotero Link",
    CITEKEY_ZOTERO_LINK_DESC: "Hide or Show the citekey link to open reference in Zotero.<br>" +
        "<b>Toggle ON:</b> Show link in the index card<br>" +
        "<b>Toggle OFF:</b> Hide link in the index card",
    ENABLE_SORTING: "Sorting References and Citations",
    ENABLE_SORTING_DESC: "Enable or Disable sorting of references in the map. <br>" +
        "This options applies to citations and references listed in each card<br>" +
        "<b>Toggle ON:</b> Sorting enabled<br>" +
        "<b>Toggle OFF:</b> Default sorting, newest to oldest reference",
    SORT_BY: "Sort By",
    SORT_BY_DESC: "Sort references and citations by the selected value",
    SORT_BY_YEAR: "Year",
    SORT_BY_CITATION_COUNT: "Citation Count",
    SORT_BY_REFERENCE_COUNT: "Reference Count",
    SORT_BY_INFLUENTIAL_CITATION_COUNT: "Influential Citation Count",
    SORT_ORDER: "Sort Order",
    SORT_ORDER_DESC: "Sort references and citations in the selected order",
    SORT_ORDER_ASC: "Ascending",
    SORT_ORDER_DESCE: "Descending",
    // metadata copy
    FORMAT_METADATA_COPY_ONE: `${clipBoard} Metadata One Button`,
    FORMAT_METADATA_COPY_ONE_DESC: "Change the format of the metadata to be copied to the clipboard when the <b>Copy Metadata One button</b> is pressed<br>" +
        "<b>Toggle ON:</b> Copy to clipboard button is shown <br>" +
        "<b>Toggle OFF:</b> Copy to clipboard button is hidden",
    FORMAT_METADATA_COPY_TWO: `${papeClip} Metadata Two Button`,
    FORMAT_METADATA_COPY_TWO_DESC: "Change the format of the metadata to be copied to the clipboard when the <b>Copy Metadata Two button</b> is pressed<br>" +
        "<b>Toggle ON:</b> Copy to clipboard button is shown <br>" +
        "<b>Toggle OFF:</b> Copy to clipboard button is hidden",
    FORMAT_METADATA_COPY_THREE: `${clipboardData} Metadata Three Button`,
    FORMAT_METADATA_COPY_THREE_DESC: "Change the format of the metadata to be copied to the clipboard when the <b>Copy Metadata Three button</b> is pressed<br>" +
        "<b>Toggle ON:</b> Copy to clipboard button is shown <br>" +
        "<b>Toggle OFF:</b> Copy to clipboard button is hidden",
    METADATA_COPY_TEMPLATE_ONE: `${clipBoard} Metadata One Template`,
    METADATA_COPY_TEMPLATE_ONE_DESC: "Template of the metadata to be copied to the clipboard.<br>" +
        "Valid variables are <code>{{title}}</code>, <code>{{author}}</code>, <code>{{authors}}</code>, <code>{{journal}}</code>, <code>{{year}}</code>, <code>{{abstract}}</code>, <code>{{url}}</code>, <code>{{pdfurl}}</code>, <code>{{doi}}</code>, <code>{{bibtex}}</code>",
    METADATA_COPY_TEMPLATE_TWO: `${papeClip} Metadata Two Template`,
    METADATA_COPY_TEMPLATE_TWO_DESC: "Template of the metadata to be copied to the clipboard.<br>" +
        "Valid variables are <code>{{title}}</code>, <code>{{author}}</code>, <code>{{authors}}</code>, <code>{{journal}}</code>, <code>{{year}}</code>, <code>{{abstract}}</code>, <code>{{url}}</code>, <code>{{pdfurl}}</code>, <code>{{doi}}</code>, <code>{{bibtex}}</code>",
    METADATA_COPY_TEMPLATE_THREE: `${clipboardData} Metadata Three Template`,
    METADATA_COPY_TEMPLATE_THREE_DESC: "Template of the metadata to be copied to the clipboard.<br>" +
        "Valid variables are <code>{{title}}</code>, <code>{{author}}</code>, <code>{{authors}}</code>, <code>{{journal}}</code>, <code>{{year}}</code>, <code>{{abstract}}</code>, <code>{{url}}</code>, <code>{{pdfurl}}</code>, <code>{{doi}}</code>, <code>{{bibtex}}</code>",
    METADATA_COPY_ONE_BATCH: `${clipBoard} Metadata One Batch`,
    METADATA_COPY_ONE_BATCH_DESC: "Copy metadata for all the references(cited papers) to the clipboard. <b>This option only applies to index card button</b>. Reference card buttons behaviour is unchanged.<br>" +
        "<b>Toggle ON:</b> Copy metadata for all references <br>" +
        "<b>Toggle OFF:</b> Copy metadata for the index reference",
    METADATA_COPY_TWO_BATCH: `${papeClip} Metadata Two Batch`,
    METADATA_COPY_TWO_BATCH_DESC: "Copy metadata for all the references(cited papers) to the clipboard. <b>This option only applies to index card button</b>. Reference card buttons behaviour is unchanged.<br>" +
        "<b>Toggle ON:</b> Copy metadata for all references <br>" +
        "<b>Toggle OFF:</b> Copy metadata for the index reference",
    METADATA_COPY_THREE_BATCH: `${clipboardData} Metadata Three Batch`,
    METADATA_COPY_THREE_BATCH_DESC: "Copy metadata for all the references(cited papers) to the clipboard. <b>This option only applies to index card button</b>. Reference card buttons behaviour is unchanged.<br>" +
        "<b>Toggle ON:</b> Copy metadata for all references <br>" +
        "<b>Toggle OFF:</b> Copy metadata for the index reference",
};

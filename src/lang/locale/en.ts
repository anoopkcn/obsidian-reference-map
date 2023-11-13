import { clipBoard, clipboardData, papeClip } from 'src/icons'

// English
export default {
	SEE_DOCUMENTATION: 'See Documentation',
	SEE_DOCUMENTATION_DESC:
		"For more information regarding the plugin see the <a href='https://github.com/anoopkcn/obsidian-reference-map/wiki'>Reference Map Wiki</a>.",
	GENERAL_SETTINGS: 'General Settings',
	REFERENCE_MAP: 'Reference Map',
	NO_REFERENCES_IN_FILE: "No reference ID's are found in the active document",
	REFRESH_VIEW: 'Refresh Map',
	REFRESH_VIEW_DESC:
		'Settings changes will not affect the current view.<br>' +
		'If you prefer to apply changes also to the current view, you can press this button',
	HIDE_SHOW_ABSTRACT: 'Hide or Show Abstract',
	HIDE_SHOW_ABSTRACT_DESC:
		'Hide or show the abstract of a references in the respective card.<br>' +
		'<b>Toggle ON:</b> Abstract will be visible <br>' +
		'<b>Toggle OFF:</b> Abstract will be hidden',
	HIDE_SHOW_AUTHORS: 'Hide or Show All Authors',
	HIDE_SHOW_AUTHORS_DESC:
		'Hide or show the authors of a references in the respective card.<br>' +
		'<b>Toggle ON:</b> All author names will be visible <br>' +
		'<b>Toggle OFF:</b> First author will be shown',
	HIDE_SHOW_BUTTONS_ON_HOVER: 'Hide or Show Buttons on Hover',
	HIDE_SHOW_BUTTONS_ON_HOVER_DESC:
		'Hide or show the buttons under index/reference cards on hover.<br>' +
		'<b> Toggle ON: </b> Buttons will be visible on hover<br>' +
		'<b> Toggle OFF: </b> Buttons will always be visible',
	HIDE_SHOW_INFLUENTIAL_COUNT: 'Hide or Show Influential Citation Count',
	HIDE_SHOW_INFLUENTIAL_COUNT_DESC:
		'Hide or show the influential citation count of references.<br>' +
		'<b> Toggle ON: </b> Influential count will be visible<br>' +
		'<b> Toggle OFF: </b> Influential count will be hidden',
	HIDE_SHOW_INVALID_ITEMS: 'Hide or Show Invalid Items',
	HIDE_SHOW_INVALID_ITEMS_DESC:
		'Hide or show the invalid Index Cards in the reference map.<br>' +
		'<b> Toggle ON: </b> Invalid items will be visible with a notice<br>' +
		'<b> Toggle OFF: </b> Invalid items will be hidden',
	HIDE_SHOW_REDUNDANT_REFERENCES: 'Hide or Show Redundant Cited or Citing Items',
	HIDE_SHOW_REDUNDANT_REFERENCES_DESC:
		'Hide or show references with no reference count and no citation count<br>' +
		'<b> Toggle ON: </b> Redundant references will be hidden<br>' +
		'<b> Toggle OFF: </b> Redundant references will be listed',
	SEARCH_TITLE: 'Get References Using File Name',
	SEARCH_TITLE_DESC:
		'Find references also using the markdown note file name in addition to reference IDs.<br>' +
		'<b>Toggle ON:</b> Get using file name is enabled<br>' +
		'<b>Toggle OFF:</b> Get using file name disabled',
	SEARCH_LIMIT: 'Get Limit',
	SEARCH_LIMIT_DESC:
		'Limit of the number of references shown in the map when <b>Get References</b> is enabled.',
	SEARCH_FRONT_MATTER: 'Get References Using Frontmatter',
	SEARCH_FRONT_MATTER_DESC:
		'Find references also using the frontmatter of the markdown note file in addition to reference IDs.<br>' +
		'<b>Toggle ON:</b> Enable search using front matter<br>' +
		'<b>Toggle OFF:</b> Disable search using front matter',
	SEARCH_FRONT_MATTER_LIMIT: 'Get Limit',
	SEARCH_FRONT_MATTER_LIMIT_DESC:
		'Limit of the number of references shown in the map when <b>Get Frontmatter</b> is enabled.',
	SEARCH_FRONT_MATTER_KEY: 'Key in the Frontmatter',
	SEARCH_FRONT_MATTER_KEY_DESC:
		'The values of the key specified here will be used to search for references.',
	SEARCH_CITEKEY: 'Get References Using <code>CiteKey</code>',
	SEARCH_CITEKEY_DESC:
		'Find references using the <code>@citekey</code> included in the markdown file in addition to reference IDs.<br>' +
		'Make sure to give a <b>valid Library File Path</b> which is exported from reference manager<br>' +
		'<b>Toggle ON:</b> Enable citekey detection<br>' +
		'<b>Toggle OFF:</b> Disable citekey detection',
	SEARCH_CITEKEY_PATH: 'Library File Path',
	SEARCH_CITEKEY_PATH_DESC:
		'Path to your CSL JSON file with <code>.json</code> extension or BibTex file with <code>.bib</code> extension.<br>' +
		'Usually exported from reference manager such as Zotero or BibDesk.<br>' +
		'Path must be relative to the vault\'s root. This option is redundant if <Code>Pull Bibliography From Zotero</code> is enabled.<br>',
	CITEKEY_PATH_ERROR: 'The citation export file can\'t be found. Please check the path.<br>' +
		'OR set <b>Pull Bibliography From Zotero</b> to TRUE and select a library.',
	AUTO_DETECT_UPDATE_TO_CITEKEY: 'Auto Detect Updates to Library',
	AUTO_DETECT_UPDATE_TO_CITEKEY_DESC:
		'Auto detect changes to the Library and update the reference map.<br>' +
		'You can also use <code>Refresh Map</code> in the Command Palette manually do the same<br>' +
		'<b>Toggle ON:</b> Enable auto detection changes in the Library<br>' +
		'<b>Toggle OFF:</b> Disable auto detection changes in the Library',
	// Zotero Pull Settings
	ZOTERO_PULL: 'Pull Bibliography From Zotero',
	ZOTERO_PULL_DESC: 'Pull data from Zotero. Zotero must have Better Bibtex plugin.',
	CANNOT_CONNECT_TO_ZOTERO: 'Cannot connect to Zotero',
	CANNOT_CONNECT_TO_ZOTERO_DESC: 'Start Zotero and try again.',
	ZOTERO_PORT: 'Zotero port',
	ZOTERO_PORT_DESC: 'Use 24119 or specify a custom port if you have changed Zotero\'s default.',
	ZOTERO_LIBRARY_ID: 'Select Libraries to Include',
	// citekey settings
	FIND_CITEKEY_WITHOUT_PREFIX: 'Process CiteKeys Without <code>@</code> Prefix',
	FIND_CITEKEY_WITHOUT_PREFIX_DESC:
		'Find and process citekey WITHOUT <code>@</code> prefix.<br>' +
		'This <b>does NOT disable</b> citekey detection with <code>@</code> prefix.<br>' +
		'<b>Toggle ON:</b> Find citekey without <code>@</code> prefix<br>' +
		'<b>Toggle OFF:</b> Do not find citekey without <code>@</code> prefix',
	CITEKEY_ZOTERO_LINK: 'Hide or Show Link to Zotero Library',
	CITEKEY_ZOTERO_LINK_DESC:
		'Hide or Show the <code>@citekey</code> link in the index cards to show reference in Zotero library.<br>' +
		'<b>Toggle ON:</b> Show link in the index card<br>' +
		'<b>Toggle OFF:</b> Hide link in the index card',
	FIND_ZOTERO_CITEKEY_FROM_ID: 'Find CiteKey from ID',
	FIND_ZOTERO_CITEKEY_FROM_ID_DESC:
		'Attempt to find citekey from ID. Check to see in the library if an entry with provided ID exists.<br>' +
		' If so the <code>{{id}}</code> metadata field is substituted by <code>{{citekey}}</code>.<br>' +
		'<b>Toggle ON:</b> Find citekey from ID and set ID to citekey<br>' +
		'<b>Toggle OFF:</b> Do not lookup citekey from ID',
	ENABLE_SORTING_REFERENCE_CARDS: 'Sort Reference Cards',
	ENABLE_SORTING_REFERENCE_CARDS_DESC:
		'Enable or Disable sorting of reference cards. <br>' +
		'<b>Toggle ON:</b> Sorting enabled<br>' +
		'<b>Toggle OFF:</b> Default sorting, newest to oldest reference',
	ENABLE_SORTING_INDEX_CARDS: 'Sort Index Cards',
	ENABLE_SORTING_INDEX_CARDS_DESC:
		'Enable or Disable sorting of index cards.<br>' +
		'<b>Toggle ON:</b> Enable sorting of the Index cards<br>' +
		'<b>Toggle OFF:</b> Default, as it is retrieved from database',
	SORT_BY: 'Sort By',
	// SORT_BY_DESC: "Sort references and citations by the selected value",
	SORT_BY_YEAR: 'Year',
	SORT_BY_CITATION_COUNT: 'Citation Count',
	SORT_BY_REFERENCE_COUNT: 'Reference Count',
	SORT_BY_INFLUENTIAL_CITATION_COUNT: 'Influential Citation Count',
	SORT_ORDER: 'Sort Order',
	// SORT_ORDER_DESC: "Sort references and citations in the selected order",
	SORT_ORDER_ASC: 'Ascending',
	SORT_ORDER_DESCE: 'Descending',
	STANDARDIZE_BIBTEX: 'Standardize BibTeX',
	STANDARDIZE_BIBTEX_DESC:
		'Standardize BibTeX of references in the map. This will format the BibTeX according to one of 14 possible entry types.<br>' +
		'<b>Toggle ON:</b> Standardize BibTeX keys<br>' +
		'<b>Toggle OFF:</b> Do not standardize BibTeX keys',
	// metadata copy
	FORMAT_METADATA_COPY_ONE: `${clipBoard} Metadata One Button`,
	FORMAT_METADATA_COPY_ONE_DESC:
		'Change the format of the metadata to be copied to the clipboard when the <b>Copy Metadata One button</b> is pressed.<br>' +
		'<b>Toggle ON:</b> Copy to clipboard button is shown <br>' +
		'<b>Toggle OFF:</b> Copy to clipboard button is hidden',
	FORMAT_METADATA_COPY_TWO: `${papeClip} Metadata Two Button`,
	FORMAT_METADATA_COPY_TWO_DESC:
		'Change the format of the metadata to be copied to the clipboard when the <b>Copy Metadata Two button</b> is pressed.<br>' +
		'<b>Toggle ON:</b> Copy to clipboard button is shown <br>' +
		'<b>Toggle OFF:</b> Copy to clipboard button is hidden',
	FORMAT_METADATA_COPY_THREE: `${clipboardData} Metadata Three Button`,
	FORMAT_METADATA_COPY_THREE_DESC:
		'Change the format of the metadata to be copied to the clipboard when the <b>Copy Metadata Three button</b> is pressed.<br>' +
		'<b>Toggle ON:</b> Copy to clipboard button is shown <br>' +
		'<b>Toggle OFF:</b> Copy to clipboard button is hidden',
	METADATA_COPY_TEMPLATE_ONE: `${clipBoard} Metadata One Template`,
	METADATA_COPY_TEMPLATE_ONE_DESC:
		'Template of the metadata to be copied to the clipboard.<br>' +
		'Valid variables are <code>{{id}}</code>, <code>{{title}}</code>, <code>{{author}}</code>, <code>{{authors}}</code>, <code>{{journal}}</code>, <code>{{volume}}</code>, <code>{{pages}}</code>, <code>{{year}}</code>, <code>{{abstract}}</code>, <code>{{url}}</code>, <code>{{pdfurl}}</code>, <code>{{doi}}</code>, <code>{{bibtex}}</code>',
	METADATA_COPY_TEMPLATE_TWO: `${papeClip} Metadata Two Template`,
	METADATA_COPY_TEMPLATE_TWO_DESC:
		'Template of the metadata to be copied to the clipboard.<br>' +
		'Valid variables are <code>{{id}}</code>, <code>{{title}}</code>, <code>{{author}}</code>, <code>{{authors}}</code>, <code>{{journal}}</code>, <code>{{volume}}</code>, <code>{{pages}}</code>, <code>{{year}}</code>, <code>{{abstract}}</code>, <code>{{url}}</code>, <code>{{pdfurl}}</code>, <code>{{doi}}</code>, <code>{{bibtex}}</code>',
	METADATA_COPY_TEMPLATE_THREE: `${clipboardData} Metadata Three Template`,
	METADATA_COPY_TEMPLATE_THREE_DESC:
		'Template of the metadata to be copied to the clipboard.<br>' +
		'Valid variables are <code>{{id}}</code>, <code>{{title}}</code>, <code>{{author}}</code>, <code>{{authors}}</code>, <code>{{journal}}</code>, <code>{{volume}}</code>, <code>{{pages}}</code>, <code>{{year}}</code>, <code>{{abstract}}</code>, <code>{{url}}</code>, <code>{{pdfurl}}</code>, <code>{{doi}}</code>, <code>{{bibtex}}</code>',
	METADATA_COPY_ONE_BATCH: `${clipBoard} Metadata One Batch`,
	METADATA_COPY_ONE_BATCH_DESC:
		'Copy metadata for all the references(cited papers) to the clipboard.<br>' +
		'<b>This option only applies to index card button and template variable {{id}} will return empty</b>.<br>' +
		'<b>Toggle ON:</b> Copy metadata for all references <br>' +
		'<b>Toggle OFF:</b> Copy metadata for the individual index/reference card',
	METADATA_COPY_TWO_BATCH: `${papeClip} Metadata Two Batch`,
	METADATA_COPY_TWO_BATCH_DESC:
		'Copy metadata for all the references(cited papers) to the clipboard.<br>' +
		'<b>This option only applies to index card button and template variable {{id}} will return empty</b>.<br>' +
		'<b>Toggle ON:</b> Copy metadata for all references <br>' +
		'<b>Toggle OFF:</b> Copy metadata for the individual index/reference card',
	METADATA_COPY_THREE_BATCH: `${clipboardData} Metadata Three Batch`,
	METADATA_COPY_THREE_BATCH_DESC:
		'Copy metadata for all the references(cited papers) to the clipboard.<br>' +
		'<b>This option only applies to index card button and template variable {{id}} will return empty</b>.<br>' +
		'<b>Toggle ON:</b> Copy metadata for all references <br>' +
		'<b>Toggle OFF:</b> Copy metadata for the individual index/reference card',
	// modal settings
	MODAL_SEARCH_LIMIT: 'Search Limit',
	MODAL_SEARCH_LIMIT_DESC: 'Number of references to show in the modal search. Default is set to 10. Maximum is 100.',
	MODAL_SEARCH_CREATE_FOLDER: 'Folder Location',
	MODAL_SEARCH_CREATE_FOLDER_DESC: 'Folder location to create the new reference. Relative to the vault root. If left blank, the new reference will be created in the vault root.',
	MODAL_SEARCH_CREATE_FILE_FORMAT: 'File Name Format',
	MODAL_SEARCH_CREATE_FILE_FORMAT_DESC: 'File name format to create the new reference. <br>' +
		'Valid variables are <code>{{id}}</code>, <code>{{title}}</code>, <code>{{author}}</code>, <code>{{authors}}</code>, <code>{{journal}}</code>, <code>{{volume}}</code>, <code>{{pages}}</code>, <code>{{year}}</code>, <code>{{abstract}}</code>, <code>{{url}}</code>, <code>{{pdfurl}}</code>, <code>{{doi}}</code>, <code>{{bibtex}}</code>',
	MODAL_SEARCH_CREATE_FILE_TEMPLATE: 'Template for New Note',
	MODAL_SEARCH_CREATE_FILE_TEMPLATE_DESC: 'Template to create the new reference markdown file.<br>' +
		'Valid variables are <code>{{id}}</code>, <code>{{title}}</code>, <code>{{author}}</code>, <code>{{authors}}</code>, <code>{{journal}}</code>, <code>{{volume}}</code>, <code>{{pages}}</code>, <code>{{year}}</code>, <code>{{abstract}}</code>, <code>{{url}}</code>, <code>{{pdfurl}}</code>, <code>{{doi}}</code>, <code>{{bibtex}}</code>',
	MODAL_SEARCH_INSERT_TEMPLATE: 'Template for Inserting to Current Note',
	MODAL_SEARCH_INSERT_TEMPLATE_DESC: 'Template to insert the reference metadata in the current note at the cursor position.<br>' +
		'Valid variables are <code>{{id}}</code>, <code>{{title}}</code>, <code>{{author}}</code>, <code>{{authors}}</code>, <code>{{journal}}</code>, <code>{{volume}}</code>, <code>{{pages}}</code>, <code>{{year}}</code>, <code>{{abstract}}</code>, <code>{{url}}</code>, <code>{{pdfurl}}</code>, <code>{{doi}}</code>, <code>{{bibtex}}</code>',
	// Debug settings
	DEBUG_MODE: 'Debug Mode',
	DEBUG_MODE_DESC:
		'Enable debug mode to see more information in the console. This is useful for debugging and <b>reporting issues</b>.<br>' +
		'Enabling this will also reset all the reference data caches of Reference map.<br>' +
		'<b>Toggle ON:</b> Enable debug mode <br>' +
		'<b>Toggle OFF:</b> Disable debug mode'
}

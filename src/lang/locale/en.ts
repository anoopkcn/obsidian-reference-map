// English
export default {
	GENERAL_SETTINGS: 'General Settings',
	REFERENCE_MAP: 'Reference Map',
	NO_REFERENCES_IN_FILE: "No entries are found in the active document",
	HIDE_SHOW_ABSTRACT: 'Show or hide abstract',
	HIDE_SHOW_ABSTRACT_DESC:
		'Show or hide the abstract.<br>' +
		'<b>Toggle ON:</b> Show abstract<br>' +
		'<b>Toggle OFF:</b> Hide abstract',
	ABSTRACT_TRUNCATE_LENGTH: 'Abstract characters truncate length',
	ABSTRACT_TRUNCATE_LENGTH_DESC:
		// 'Number of characters to truncate the abstract.<br>' +
		// 'Abstract will be truncated to this length and appended with <code>...</code><br>' +
		'If set to 0, abstract will NOT be truncated (default 160)',
	HIDE_SHOW_AUTHORS: 'Show or hide the names of all authors',
	HIDE_SHOW_AUTHORS_DESC:
		'Show or hide the names of all authors.<br>' +
		'<b>Toggle ON:</b> Show all contributors<br>' +
		'<b>Toggle OFF:</b> Show one contributor',
	HIDE_SHOW_JOURNAL: 'Show or hide journal, volume and pages',
	HIDE_SHOW_JOURNAL_DESC:
		'Show or hide the journal name, volume and pages.<br>' +
		'<b>Toggle ON:</b> Show journal name, volume and pages<br>' +
		'<b>Toggle OFF:</b> Hide journal name, volume and pages',
	HIDE_SHOW_BUTTONS_ON_HOVER: 'Show or hide buttons on hover',
	HIDE_SHOW_BUTTONS_ON_HOVER_DESC:
		'Automatically show and hide buttons<br>' +
		'<b> Toggle ON:</b> Show buttons on hover<br>' +
		'<b> Toggle OFF:</b> Always show buttons',
	HIDE_SHOW_INFLUENTIAL_COUNT: 'Show or hide influential citation count',
	HIDE_SHOW_INFLUENTIAL_COUNT_DESC:
		'Show or Hide the influential citation count.<br>' +
		'<b> Toggle ON:</b> Show influential count<br>' +
		'<b> Toggle OFF:</b> Hide Influential count',
	HIDE_SHOW_INVALID_ITEMS: 'Show or hide invalid',
	HIDE_SHOW_INVALID_ITEMS_DESC:
		'Show or Hide Entries that could not be processed.<br>' +
		'<b> Toggle ON:</b> Show notice about invalid entry<br>' +
		'<b> Toggle OFF:</b> Hide notice about invalid entry',
	HIDE_SHOW_REDUNDANT_REFERENCES: 'Show or hide redundant items',
	HIDE_SHOW_REDUNDANT_REFERENCES_DESC:
		'Show or Hide references with <b>no cited/citation</b> count<br>' +
		'<b> Toggle ON:</b> Redundant entries will be hidden<br>' +
		'<b> Toggle OFF:</b> Redundant entries will be listed',
	LOOKUP_ENTRIES_LINKED_FILES: 'Lookup entries in linked files',
	LOOKUP_ENTRIES_LINKED_FILES_DESC:
		'Include entries found in the linked files(wiki links).<br>' +
		'Enabling will also hide the location indicators.<br>' +
		'<b>Toggle ON:</b> Enable lookup in linked files<br>' +
		'<b>Toggle OFF:</b> Disable lookup in linked files',
	REMOVE_DUPLICATE_IDS: 'Remove duplicate cards',
	REMOVE_DUPLICATE_IDS_DESC:
		'Remove duplicated cards from the reference map sidebar.<br>' +
		'<b>Toggle ON:</b> Remove duplicate cards<br>' +
		'<b>Toggle OFF:</b> Keep duplicate cards',
	SEARCH_TITLE: 'Get using file name',
	SEARCH_TITLE_DESC:
		'Find references using the markdown file name in addition to entries in the file.<br>' +
		'<b>Toggle ON:</b> Get using file name is enabled<br>' +
		'<b>Toggle OFF:</b> Get using file name disabled',
	SEARCH_LIMIT: 'Get limit',
	SEARCH_LIMIT_DESC:
		'Number of entries shown in the reference map when <b>Get Using File Name</b> is enabled.',
	SEARCH_FRONT_MATTER: 'Get using frontmatter',
	SEARCH_FRONT_MATTER_DESC:
		'Find references also using the frontmatter of the markdown note file in addition to reference IDs.<br>' +
		'<b>Toggle ON:</b> Enable search using front matter<br>' +
		'<b>Toggle OFF:</b> Disable search using front matter',
	SEARCH_FRONT_MATTER_LIMIT: 'Get limit',
	SEARCH_FRONT_MATTER_LIMIT_DESC:
		'Number of entries shown in the reference map when <b>Get Using Frontmatter</b> is enabled.',
	SEARCH_FRONT_MATTER_KEY: 'Key in the frontmatter',
	SEARCH_FRONT_MATTER_KEY_DESC:
		'Keyword specified here will be used to search for references.',
	SEARCH_CITEKEY: 'Get references using <code>citeKey</code>',
	SEARCH_CITEKEY_DESC:
		'Find references using the <code>@citekey</code> included in the markdown file in addition to reference IDs.<br>' +
		'Make sure to enable <b>Pull bibliography from Zotero</b> option OR give a <b>valid library file</b><br>' +
		'<b>Toggle ON:</b> Enable citekey detection<br>' +
		'<b>Toggle OFF:</b> Disable citekey detection',
	SEARCH_CITEKEY_PATH: 'Library file path',
	SEARCH_CITEKEY_PATH_DESC:
		'Path to your CSL JSON file with <code>.json</code> extension or BibTex file with <code>.bib</code> extension.<br>' +
		'Usually exported from reference manager such as Zotero or BibDesk.<br>' +
		'Path must be relative to the vault\'s root. This option is redundant if <Code>Pull Bibliography From Zotero</code> is enabled.<br>',
	CITEKEY_PATH_ERROR: 'The citation export file can\'t be found. Please check the path.<br>' +
		'OR set <b>Pull Bibliography From Zotero</b> to TRUE and select a library.',
	AUTO_DETECT_UPDATE_TO_CITEKEY: 'Auto detect updates to library',
	AUTO_DETECT_UPDATE_TO_CITEKEY_DESC:
		'Auto detect changes to the Library and update the reference map.<br>' +
		'You can also use <code>Refresh Map</code> in the command palette to manually do the same<br>' +
		'<b>Toggle ON:</b> Enable auto detection changes in the Library<br>' +
		'<b>Toggle OFF:</b> Disable auto detection changes in the Library',
	// Zotero Pull Settings
	ZOTERO_PULL: 'Pull bibliography from Zotero',
	ZOTERO_PULL_DESC: 'Pull data from Zotero. Zotero must have Better BibTex plugin.',
	CANNOT_CONNECT_TO_ZOTERO: 'Cannot connect to Zotero',
	CANNOT_CONNECT_TO_ZOTERO_DESC: 'Start Zotero and try again.',
	ZOTERO_PORT: 'Zotero port',
	ZOTERO_PORT_DESC: 'Use 23119 or specify a custom port if you have changed Zotero\'s default.',
	ZOTERO_LIBRARY_ID: 'Select libraries to include',
	// citekey settings
	FIND_CITEKEY_WITHOUT_PREFIX: 'Process citeKeys without <code>@</code> prefix',
	FIND_CITEKEY_WITHOUT_PREFIX_DESC:
		'Find and process citekey WITHOUT <code>@</code> prefix.<br>' +
		'This <b>does NOT disable</b> citekey detection with <code>@</code> prefix.<br>' +
		'<b>Toggle ON:</b> Find citekey without <code>@</code> prefix<br>' +
		'<b>Toggle OFF:</b> Do not find citekey without <code>@</code> prefix',
	CITEKEY_ZOTERO_LINK: 'Show or hide link to view item in Zotero library',
	CITEKEY_ZOTERO_LINK_DESC:
		'Show or Hide the link (as <code>@citekey</code>) to open item in zotero.<br>' +
		'<b>Toggle ON:</b> Show link in the index card<br>' +
		'<b>Toggle OFF:</b> Hide link in the index card',
	FIND_ZOTERO_CITEKEY_FROM_ID: 'Find citeKey from ID entry',
	FIND_ZOTERO_CITEKEY_FROM_ID_DESC:
		'Attempt to find citekey from ID(DOI, URL,et,.).<br>' +
		' If found the <code>{{id}}</code> metadata field is substituted by <code>{{citekey}}</code>.<br>' +
		'<b>Toggle ON:</b> Find citekey from ID and set ID to citekey<br>' +
		'<b>Toggle OFF:</b> Do not lookup citekey from ID',
	ENABLE_SORTING_REFERENCE_CARDS: 'Sort sidebar citing and cited cards',
	ENABLE_SORTING_REFERENCE_CARDS_DESC:
		'Enable or Disable sorting of reference/citation cards. <br>' +
		'<b>Toggle ON:</b> Enable sorting<br>' +
		'<b>Toggle OFF:</b> Default sorting, as it is retrieved from database',
	ENABLE_SORTING_INDEX_CARDS: 'Sort sidebar index cards',
	ENABLE_SORTING_INDEX_CARDS_DESC:
		'Enable or Disable sorting of index cards.<br>' +
		'<b>Toggle ON:</b> Enable sorting of the Index cards<br>' +
		'<b>Toggle OFF:</b> Default sorting, as appear in the markdown',
	SORT_BY: 'Sort By',
	// SORT_BY_DESC: "Sort references and citations by the selected value",
	SORT_BY_YEAR: 'Year',
	SORT_BY_CITATION_COUNT: 'Citation count',
	SORT_BY_REFERENCE_COUNT: 'Reference count',
	SORT_BY_INFLUENTIAL_CITATION_COUNT: 'Influential citation count',
	SORT_ORDER: 'Sort order',
	// SORT_ORDER_DESC: "Sort references and citations in the selected order",
	SORT_ORDER_ASC: 'Ascending',
	SORT_ORDER_DESC: 'Descending',
	// metadata copy
	FORMAT_METADATA_COPY_ONE: `Metadata button one`,
	FORMAT_METADATA_COPY_ONE_DESC:
		'Change the format of the metadata to be copied to the clipboard',
	FORMAT_METADATA_COPY_ONE_ON: 'Copy to clipboard button is shown',
	FORMAT_METADATA_COPY_ONE_OFF: 'Copy to clipboard button is hidden',
	FORMAT_METADATA_COPY_TWO: `Metadata button two`,
	FORMAT_METADATA_COPY_TWO_DESC:
		'Change the format of the metadata to be copied to the clipboard',
	FORMAT_METADATA_COPY_TWO_ON: 'Copy to clipboard button is shown',
	FORMAT_METADATA_COPY_TWO_OFF: 'Copy to clipboard button is hidden',
	FORMAT_METADATA_COPY_THREE: `Metadata button three`,
	FORMAT_METADATA_COPY_THREE_DESC:
		'Change the format of the metadata to be copied to the clipboard',
	FORMAT_METADATA_COPY_THREE_ON: 'Copy to clipboard button is shown',
	FORMAT_METADATA_COPY_THREE_OFF: 'Copy to clipboard button is hidden',
	METADATA_COPY_TEMPLATE_ONE: `Metadata template one`,
	METADATA_COPY_TEMPLATE_ONE_DESC:
		'Template of the metadata to be copied to the clipboard. ' +
		'Valid variables are {{id}}, {{title}}, {{author}}, {{authors}}, {{journal}}, {{volume}}, {{pages}}, {{year}}, {{abstract}}, {{url}}, {{pdfurl}}, {{doi}}, {{bibtex}}',
	METADATA_COPY_TEMPLATE_TWO: `Metadata template two`,
	METADATA_COPY_TEMPLATE_TWO_DESC:
		'Template of the metadata to be copied to the clipboard. ' +
		'Valid variables are {{id}}, {{title}}, {{author}}, {{authors}}, {{journal}}, {{volume}}, {{pages}}, {{year}}, {{abstract}}, {{url}}, {{pdfurl}}, {{doi}}, {{bibtex}}',
	METADATA_COPY_TEMPLATE_THREE: `Metadata template three`,
	METADATA_COPY_TEMPLATE_THREE_DESC:
		'Template of the metadata to be copied to the clipboard.<br>' +
		'Valid variables are {{id}}, {{title}}, {{author}}, {{authors}}, {{journal}}, {{volume}}, {{pages}}, {{year}}, {{abstract}}, {{url}}, {{pdfurl}}, {{doi}}, {{bibtex}}',
	METADATA_COPY_ONE_BATCH: `Metadata batch one`,
	METADATA_COPY_ONE_BATCH_DESC:
		'Copy metadata for all the references(cited papers) to the clipboard. This option only applies to index card button and template variable {{id}} will return empty',
	METADATA_COPY_ONE_BATCH_ON: 'Copy metadata for all references',
	METADATA_COPY_ONE_BATCH_OFF: 'Copy metadata for the individual index/reference card',

	METADATA_COPY_TWO_BATCH: `Metadata batch two`,
	METADATA_COPY_TWO_BATCH_DESC:
		'Copy metadata for all the references(cited papers) to the clipboard. This option only applies to index card button and template variable {{id}} will return empty',
	METADATA_COPY_TWO_BATCH_ON: 'Copy metadata for all references',
	METADATA_COPY_TWO_BATCH_OFF: 'Copy metadata for the individual index/reference card',

	METADATA_COPY_THREE_BATCH: `Metadata batch three`,
	METADATA_COPY_THREE_BATCH_DESC:
		'Copy metadata for all the references(cited papers) to the clipboard. This option only applies to index card button and template variable {{id}} will return empty',
	METADATA_COPY_THREE_BATCH_ON: 'Copy metadata for all references',
	METADATA_COPY_THREE_BATCH_OFF: 'Copy metadata for the individual index/reference card',
	// modal settings
	MODAL_SEARCH_LIMIT: 'Search limit',
	MODAL_SEARCH_LIMIT_DESC: 'Number of references to show in the modal search. Default is set to 10. Maximum is 100.',
	MODAL_SEARCH_CREATE_FOLDER: 'Folder location',
	MODAL_SEARCH_CREATE_FOLDER_DESC: 'Folder location to create the new reference. Relative to the vault root. If left blank, the new reference will be created in the vault root.',
	MODAL_SEARCH_CREATE_FILE_FORMAT: 'File name format',
	MODAL_SEARCH_CREATE_FILE_FORMAT_DESC: 'File name format to create the new reference. <br>' +
		'Valid variables are <code>{{id}}</code>, <code>{{title}}</code>, <code>{{author}}</code>, <code>{{authors}}</code>, <code>{{journal}}</code>, <code>{{volume}}</code>, <code>{{pages}}</code>, <code>{{year}}</code>, <code>{{abstract}}</code>, <code>{{url}}</code>, <code>{{pdfurl}}</code>, <code>{{doi}}</code>, <code>{{bibtex}}</code>',
	MODAL_SEARCH_CREATE_FILE_TEMPLATE: 'Template for new note',
	MODAL_SEARCH_CREATE_FILE_TEMPLATE_DESC: 'Template to create the new reference markdown file.<br>' +
		'Valid variables are <code>{{id}}</code>, <code>{{title}}</code>, <code>{{author}}</code>, <code>{{authors}}</code>, <code>{{journal}}</code>, <code>{{volume}}</code>, <code>{{pages}}</code>, <code>{{year}}</code>, <code>{{abstract}}</code>, <code>{{url}}</code>, <code>{{pdfurl}}</code>, <code>{{doi}}</code>, <code>{{bibtex}}</code>',
	MODAL_SEARCH_INSERT_TEMPLATE: 'Template for inserting to current note',
	MODAL_SEARCH_INSERT_TEMPLATE_DESC: 'Template to insert the reference metadata in the current note at the cursor position.<br>' +
		'Valid variables are <code>{{id}}</code>, <code>{{title}}</code>, <code>{{author}}</code>, <code>{{authors}}</code>, <code>{{journal}}</code>, <code>{{volume}}</code>, <code>{{pages}}</code>, <code>{{year}}</code>, <code>{{abstract}}</code>, <code>{{url}}</code>, <code>{{pdfurl}}</code>, <code>{{doi}}</code>, <code>{{bibtex}}</code>',
	// Debug settings
	DEBUG_MODE: 'Debug mode',
	DEBUG_MODE_DESC:
		'Enable debug mode to see more information in the console. This is useful for debugging and <b>reporting issues</b>.<br>' +
		'Enabling this will also reset all the reference data caches of Reference map.<br>' +
		'<b>Toggle ON:</b> Enable debug mode <br>' +
		'<b>Toggle OFF:</b> Disable debug mode',
	SEE_DOCUMENTATION: 'See documentation',
	SEE_DOCUMENTATION_DESC:
		"For more information regarding the plugin see the <a href='https://github.com/anoopkcn/obsidian-reference-map/wiki'>Reference Map Wiki</a>.",

	FORMAT_CSL: 'CSL format',
	FORMAT_CSL_DESC: 'Format the citation according to a CSL format to be used for bibliography. This will add a new template variable {{csl}} to be used in buttons and templates. If you have a lot of references in the markdown or you are using lookup in linked files, this may slow down citing cited rendering since this option will apply to all the retrieved data.',
}

export const IEEE = `<?xml version="1.0" encoding="utf-8"?>
<style xmlns="http://purl.org/net/xbiblio/csl" class="in-text" version="1.0" demote-non-dropping-particle="sort-only">
  <info>
    <title>IEEE</title>
    <id>http://www.zotero.org/styles/ieee</id>
    <link href="http://www.zotero.org/styles/ieee" rel="self"/>
    <!-- <link href="https://ieeeauthorcenter.ieee.org/wp-content/uploads/IEEE-Reference-Guide.pdf" rel="documentation"/> - 2018 guidelines -->
    <link href="http://journals.ieeeauthorcenter.ieee.org/wp-content/uploads/sites/7/IEEE_Reference_Guide.pdf" rel="documentation"/>
    <link href="https://journals.ieeeauthorcenter.ieee.org/your-role-in-article-production/ieee-editorial-style-manual/" rel="documentation"/>
    <author>
      <name>Michael Berkowitz</name>
      <email>mberkowi@gmu.edu</email>
    </author>
    <contributor>
      <name>Julian Onions</name>
      <email>julian.onions@gmail.com</email>
    </contributor>
    <contributor>
      <name>Rintze Zelle</name>
      <uri>http://twitter.com/rintzezelle</uri>
    </contributor>
    <contributor>
      <name>Stephen Frank</name>
      <uri>http://www.zotero.org/sfrank</uri>
    </contributor>
    <contributor>
      <name>Sebastian Karcher</name>
    </contributor>
    <contributor>
      <name>Giuseppe Silano</name>
      <email>g.silano89@gmail.com</email>
      <uri>http://giuseppesilano.net</uri>
    </contributor>
    <contributor>
      <name>Patrick O'Brien</name>
    </contributor>
    <contributor>
      <name>Brenton M. Wiernik</name>
    </contributor>
    <contributor>
      <name>Oliver Couch</name>
      <email>oliver.couch@gmail.com</email>
    </contributor>
    <category citation-format="numeric"/>
    <category field="engineering"/>
    <category field="generic-base"/>
    <summary>IEEE style as per the 2021 guidelines, V 01.29.2021.</summary>
    <updated>2023-04-18T00:52:46+10:00</updated>
    <rights license="http://creativecommons.org/licenses/by-sa/3.0/">This work is licensed under a Creative Commons Attribution-ShareAlike 3.0 License</rights>
  </info>
  <locale xml:lang="en">
    <date form="text">
      <date-part name="month" form="short" suffix=" "/>
      <date-part name="day" form="numeric-leading-zeros" suffix=", "/>
      <date-part name="year"/>
    </date>
    <terms>
      <term name="chapter" form="short">ch.</term>
      <term name="presented at">presented at the</term>
      <term name="available at">available</term>
    </terms>
  </locale>
  <!-- Macros -->
  <macro name="status">
    <choose>
      <if variable="page issue volume" match="none">
        <text variable="status" text-case="capitalize-first" suffix="" font-weight="bold"/>
      </if>
    </choose>
  </macro>
  <macro name="edition">
    <choose>
      <if type="bill book chapter graphic legal_case legislation motion_picture paper-conference report song" match="any">
        <choose>
          <if is-numeric="edition">
            <group delimiter=" ">
              <number variable="edition" form="ordinal"/>
              <text term="edition" form="short"/>
            </group>
          </if>
          <else>
            <text variable="edition" text-case="capitalize-first" suffix="."/>
          </else>
        </choose>
      </if>
    </choose>
  </macro>
  <macro name="issued">
    <choose>
      <if type="article-journal report" match="any">
        <date variable="issued">
          <date-part name="month" form="short" suffix=" "/>
          <date-part name="year" form="long"/>
        </date>
      </if>
      <else-if type="bill book chapter graphic legal_case legislation song thesis" match="any">
        <date variable="issued">
          <date-part name="year" form="long"/>
        </date>
      </else-if>
      <else-if type="paper-conference" match="any">
        <date variable="issued">
          <date-part name="month" form="short"/>
          <date-part name="year" prefix=" "/>
        </date>
      </else-if>
      <else-if type="motion_picture" match="any">
        <date variable="issued" form="text" prefix="(" suffix=")"/>
      </else-if>
      <else>
        <date variable="issued" form="text"/>
      </else>
    </choose>
  </macro>
  <macro name="author">
    <names variable="author">
      <name and="text" et-al-min="7" et-al-use-first="1" initialize-with=". "/>
      <label form="short" prefix=", " text-case="capitalize-first"/>
      <et-al font-style="italic"/>
      <substitute>
        <names variable="editor"/>
        <names variable="translator"/>
      </substitute>
    </names>
  </macro>
  <macro name="editor">
    <names variable="editor">
      <name initialize-with=". " delimiter=", " and="text"/>
      <label form="short" prefix=", " text-case="capitalize-first"/>
    </names>
  </macro>
  <macro name="locators">
    <group delimiter=", ">
      <text macro="edition"/>
      <group delimiter=" ">
        <text term="volume" form="short"/>
        <number variable="volume" form="numeric"/>
      </group>
      <group delimiter=" ">
        <number variable="number-of-volumes" form="numeric"/>
        <text term="volume" form="short" plural="true"/>
      </group>
      <group delimiter=" ">
        <text term="issue" form="short"/>
        <number variable="issue" form="numeric"/>
      </group>
    </group>
  </macro>
  <macro name="title">
    <choose>
      <if type="bill book graphic legal_case legislation motion_picture song" match="any">
        <text variable="title" font-style="italic"/>
      </if>
      <else>
        <text variable="title" quotes="true"/>
      </else>
    </choose>
  </macro>
  <macro name="publisher">
    <choose>
      <if type="bill book chapter graphic legal_case legislation motion_picture paper-conference song" match="any">
        <group delimiter=": ">
          <text variable="publisher-place"/>
          <text variable="publisher"/>
        </group>
      </if>
      <else>
        <group delimiter=", ">
          <text variable="publisher"/>
          <text variable="publisher-place"/>
        </group>
      </else>
    </choose>
  </macro>
  <macro name="event">
    <choose>
      <!-- Published Conference Paper -->
      <if type="paper-conference speech" match="any">
        <choose>
          <if variable="container-title" match="any">
            <group delimiter=" ">
              <text term="in"/>
              <text variable="container-title" font-style="italic"/>
            </group>
          </if>
          <!-- Unpublished Conference Paper -->
          <else>
            <group delimiter=" ">
              <text term="presented at"/>
              <text variable="event"/>
            </group>
          </else>
        </choose>
      </if>
    </choose>
  </macro>
  <macro name="access">
    <choose>
      <if type="webpage post post-weblog" match="any">
        <!-- https://url.com/ (accessed Mon. DD, YYYY). -->
        <choose>
          <if variable="URL">
            <group delimiter=". " prefix=" ">
              <group delimiter=": ">
                <text term="accessed" text-case="capitalize-first"/>
                <date variable="accessed" form="text"/>
              </group>
              <text term="online" prefix="[" suffix="]" text-case="capitalize-first"/>
              <group delimiter=": ">
                <text term="available at" text-case="capitalize-first"/>
                <text variable="URL"/>
              </group>
            </group>
          </if>
        </choose>
      </if>
      <else-if match="any" variable="DOI">
        <!-- doi: 10.1000/xyz123. -->
        <text variable="DOI" prefix=" doi: " suffix="."/>
      </else-if>
      <else-if variable="URL">
        <!-- Accessed: Mon. DD, YYYY. [Medium]. Available: https://URL.com/ -->
        <group delimiter=". " prefix=" " suffix=". ">
          <!-- Accessed: Mon. DD, YYYY. -->
          <group delimiter=": ">
            <text term="accessed" text-case="capitalize-first"/>
            <date variable="accessed" form="text"/>
          </group>
          <!-- [Online Video]. -->
          <group prefix="[" suffix="]" delimiter=" ">
            <choose>
              <if variable="medium" match="any">
                <text variable="medium" text-case="capitalize-first"/>
              </if>
              <else>
                <text term="online" text-case="capitalize-first"/>
                <choose>
                  <if type="motion_picture">
                    <text term="video" text-case="capitalize-first"/>
                  </if>
                </choose>
              </else>
            </choose>
          </group>
        </group>
        <!-- Available: https://URL.com/ -->
        <group delimiter=": " prefix=" ">
          <text term="available at" text-case="capitalize-first"/>
          <text variable="URL"/>
        </group>
      </else-if>
    </choose>
  </macro>
  <macro name="page">
    <choose>
      <if type="article-journal" variable="number" match="all">
        <group delimiter=" ">
          <text value="Art."/>
          <text term="issue" form="short"/>
          <text variable="number"/>
        </group>
      </if>
      <else>
        <group delimiter=" ">
          <label variable="page" form="short"/>
          <text variable="page"/>
        </group>
      </else>
    </choose>
  </macro>
  <macro name="citation-locator">
    <group delimiter=" ">
      <choose>
        <if locator="page">
          <label variable="locator" form="short"/>
        </if>
        <else>
          <label variable="locator" form="short" text-case="capitalize-first"/>
        </else>
      </choose>
      <text variable="locator"/>
    </group>
  </macro>
  <macro name="geographic-location">
    <group delimiter=", " suffix=".">
      <choose>
        <if variable="publisher-place">
          <text variable="publisher-place" text-case="title"/>
        </if>
        <else-if variable="event-place">
          <text variable="event-place" text-case="title"/>
        </else-if>
      </choose>
    </group>
  </macro>
  <!-- Series -->
  <macro name="collection">
    <choose>
      <if variable="collection-title" match="any">
        <text term="in" suffix=" "/>
        <group delimiter=", " suffix=". ">
          <text variable="collection-title"/>
          <text variable="collection-number" prefix="no. "/>
          <text variable="volume" prefix="vol. "/>
        </group>
      </if>
    </choose>
  </macro>
  <!-- Citation -->
  <citation collapse="citation-number">
    <sort>
      <key variable="citation-number"/>
    </sort>
    <layout delimiter=", ">
      <group prefix="[" suffix="]" delimiter=", ">
        <text variable="citation-number"/>
        <text macro="citation-locator"/>
      </group>
    </layout>
  </citation>
  <!-- Bibliography -->
  <bibliography entry-spacing="0" second-field-align="flush">
    <layout>
      <!-- Citation Number -->
      <text variable="citation-number" prefix="[" suffix="]"/>
      <!-- Author(s) -->
      <text macro="author" suffix=", "/>
      <!-- Rest of Citation -->
      <choose>
        <!-- Specific Formats -->
        <if type="article-journal">
          <group delimiter=", ">
            <text macro="title"/>
            <text variable="container-title" font-style="italic" form="short"/>
            <text macro="locators"/>
            <text macro="page"/>
            <text macro="issued"/>
            <text macro="status"/>
          </group>
          <choose>
            <if variable="URL DOI" match="none">
              <text value="."/>
            </if>
            <else>
              <text value=","/>
            </else>
          </choose>
          <text macro="access"/>
        </if>
        <else-if type="paper-conference speech" match="any">
          <group delimiter=", " suffix=", ">
            <text macro="title"/>
            <text macro="event"/>
            <text macro="editor"/>
          </group>
          <text macro="collection"/>
          <group delimiter=", " suffix=".">
            <text macro="publisher"/>
            <text macro="issued"/>
            <text macro="page"/>
            <text macro="status"/>
          </group>
          <text macro="access"/>
        </else-if>
        <else-if type="chapter">
          <group delimiter=", " suffix=". ">
            <text macro="title"/>
            <group delimiter=" ">
              <text term="in" suffix=" "/>
              <text variable="container-title" font-style="italic"/>
            </group>
            <text macro="locators"/>
            <text macro="editor"/>
            <text macro="collection"/>
            <text macro="publisher"/>
            <text macro="issued"/>
            <text macro="page"/>
          </group>
          <text macro="access"/>
        </else-if>
        <else-if type="report">
          <group delimiter=", " suffix=".">
            <text macro="title"/>
            <text macro="publisher"/>
            <group delimiter=" ">
              <text variable="genre"/>
              <text variable="number"/>
            </group>
            <text macro="issued"/>
          </group>
          <text macro="access"/>
        </else-if>
        <else-if type="thesis">
          <group delimiter=", " suffix=".">
            <text macro="title"/>
            <text variable="genre"/>
            <text macro="publisher"/>
            <text macro="issued"/>
          </group>
          <text macro="access"/>
        </else-if>
        <else-if type="webpage post-weblog post" match="any">
          <group delimiter=", " suffix=".">
            <text macro="title"/>
            <text variable="container-title"/>
          </group>
          <text macro="access"/>
        </else-if>
        <else-if type="patent">
          <group delimiter=", ">
            <text macro="title"/>
            <text variable="number"/>
            <text macro="issued"/>
          </group>
          <text macro="access"/>
        </else-if>
        <!-- Online Video -->
        <else-if type="motion_picture">
          <text macro="geographic-location" suffix=". "/>
          <group delimiter=", " suffix=".">
            <text macro="title"/>
            <text macro="issued"/>
          </group>
          <text macro="access"/>
        </else-if>
        <!-- Generic/Fallback Formats -->
        <else-if type="bill book graphic legal_case legislation report song" match="any">
          <group delimiter=", " suffix=". ">
            <text macro="title"/>
            <text macro="locators"/>
          </group>
          <text macro="collection"/>
          <group delimiter=", " suffix=".">
            <text macro="publisher"/>
            <text macro="issued"/>
            <text macro="page"/>
          </group>
          <text macro="access"/>
        </else-if>
        <else-if type="article-magazine article-newspaper broadcast interview manuscript map patent personal_communication song speech thesis webpage" match="any">
          <group delimiter=", " suffix=".">
            <text macro="title"/>
            <text variable="container-title" font-style="italic"/>
            <text macro="locators"/>
            <text macro="publisher"/>
            <text macro="page"/>
            <text macro="issued"/>
          </group>
          <text macro="access"/>
        </else-if>
        <else>
          <group delimiter=", " suffix=". ">
            <text macro="title"/>
            <text variable="container-title" font-style="italic"/>
            <text macro="locators"/>
          </group>
          <text macro="collection"/>
          <group delimiter=", " suffix=".">
            <text macro="publisher"/>
            <text macro="page"/>
            <text macro="issued"/>
          </group>
          <text macro="access"/>
        </else>
      </choose>
    </layout>
  </bibliography>
</style>
`
export const LOCALE_EN_US = `<?xml version="1.0" encoding="utf-8"?>
<locale xmlns="http://purl.org/net/xbiblio/csl" version="1.0" xml:lang="en-US">
  <info>
    <translator>
      <name>Andrew Dunning</name>
    </translator>
    <translator>
      <name>Sebastian Karcher</name>
    </translator>
    <translator>
      <name>Rintze M. Zelle</name>
    </translator>
    <translator>
      <name>Denis Meier</name>
    </translator>
    <translator>
      <name>Brenton M. Wiernik</name>
    </translator>
    <rights license="http://creativecommons.org/licenses/by-sa/3.0/">This work is licensed under a Creative Commons Attribution-ShareAlike 3.0 License</rights>
    <updated>2015-10-10T23:31:02+00:00</updated>
  </info>
  <style-options punctuation-in-quote="true"/>
  <date form="text">
    <date-part name="month" suffix=" "/>
    <date-part name="day" suffix=", "/>
    <date-part name="year"/>
  </date>
  <date form="numeric">
    <date-part name="month" form="numeric-leading-zeros" suffix="/"/>
    <date-part name="day" form="numeric-leading-zeros" suffix="/"/>
    <date-part name="year"/>
  </date>
  <terms>
    <term name="advance-online-publication">advance online publication</term>
    <term name="album">album</term>
    <term name="audio-recording">audio recording</term>
    <term name="film">film</term>
    <term name="henceforth">henceforth</term>
    <term name="loc-cit">loc. cit.</term> <!-- like ibid., the abbreviated form is the regular form  -->
    <term name="no-place">no place</term>
    <term name="no-place" form="short">n.p.</term>
    <term name="no-publisher">no publisher</term> <!-- sine nomine -->
    <term name="no-publisher" form="short">n.p.</term>
    <term name="on">on</term>
    <term name="op-cit">op. cit.</term> <!-- like ibid., the abbreviated form is the regular form  -->
    <term name="original-work-published">original work published</term>
    <term name="personal-communication">personal communication</term>
    <term name="podcast">podcast</term>
    <term name="podcast-episode">podcast episode</term>
    <term name="preprint">preprint</term>
    <term name="radio-broadcast">radio broadcast</term>
    <term name="radio-series">radio series</term>
    <term name="radio-series-episode">radio series episode</term>
    <term name="special-issue">special issue</term>
    <term name="special-section">special section</term>
    <term name="television-broadcast">television broadcast</term>
    <term name="television-series">television series</term>
    <term name="television-series-episode">television series episode</term>
    <term name="video">video</term>
    <term name="working-paper">working paper</term>
    <term name="accessed">accessed</term>
    <term name="and">and</term>
    <term name="and others">and others</term>
    <term name="anonymous">anonymous</term>
    <term name="anonymous" form="short">anon.</term>
    <term name="at">at</term>
    <term name="available at">available at</term>
    <term name="by">by</term>
    <term name="circa">circa</term>
    <term name="circa" form="short">c.</term>
    <term name="cited">cited</term>
    <term name="edition">
      <single>edition</single>
      <multiple>editions</multiple>
    </term>
    <term name="edition" form="short">ed.</term>
    <term name="et-al">et al.</term>
    <term name="forthcoming">forthcoming</term>
    <term name="from">from</term>
    <term name="ibid">ibid.</term>
    <term name="in">in</term>
    <term name="in press">in press</term>
    <term name="internet">internet</term>
    <term name="letter">letter</term>
    <term name="no date">no date</term>
    <term name="no date" form="short">n.d.</term>
    <term name="online">online</term>
    <term name="presented at">presented at the</term>
    <term name="reference">
      <single>reference</single>
      <multiple>references</multiple>
    </term>
    <term name="reference" form="short">
      <single>ref.</single>
      <multiple>refs.</multiple>
    </term>
    <term name="retrieved">retrieved</term>
    <term name="scale">scale</term>
    <term name="version">version</term>

    <!-- LONG ITEM TYPE FORMS -->
    <term name="article">preprint</term>
    <term name="article-journal">journal article</term>
    <term name="article-magazine">magazine article</term>
    <term name="article-newspaper">newspaper article</term>
    <term name="bill">bill</term>
    <!-- book is in the list of locator terms -->
    <term name="broadcast">broadcast</term>
    <!-- chapter is in the list of locator terms -->
    <term name="classic">classic</term>
    <term name="collection">collection</term>
    <term name="dataset">dataset</term>
    <term name="document">document</term>
    <term name="entry">entry</term>
    <term name="entry-dictionary">dictionary entry</term>
    <term name="entry-encyclopedia">encyclopedia entry</term>
    <term name="event">event</term>
    <!-- figure is in the list of locator terms -->
    <term name="graphic">graphic</term>
    <term name="hearing">hearing</term>
    <term name="interview">interview</term>
    <term name="legal_case">legal case</term>
    <term name="legislation">legislation</term>
    <term name="manuscript">manuscript</term>
    <term name="map">map</term>
    <term name="motion_picture">video recording</term>
    <term name="musical_score">musical score</term>
    <term name="pamphlet">pamphlet</term>
    <term name="paper-conference">conference paper</term>
    <term name="patent">patent</term>
    <term name="performance">performance</term>
    <term name="periodical">periodical</term>
    <term name="personal_communication">personal communication</term>
    <term name="post">post</term>
    <term name="post-weblog">blog post</term>
    <term name="regulation">regulation</term>
    <term name="report">report</term>
    <term name="review">review</term>
    <term name="review-book">book review</term>
    <term name="software">software</term>
    <term name="song">audio recording</term>
    <term name="speech">presentation</term>
    <term name="standard">standard</term>
    <term name="thesis">thesis</term>
    <term name="treaty">treaty</term>
    <term name="webpage">webpage</term>

    <!-- SHORT ITEM TYPE FORMS -->
    <term name="article-journal" form="short">journal art.</term>
    <term name="article-magazine" form="short">mag. art.</term>
    <term name="article-newspaper" form="short">newspaper art.</term>
    <!-- book is in the list of locator terms -->
    <!-- chapter is in the list of locator terms -->
    <term name="document" form="short">doc.</term>
    <!-- figure is in the list of locator terms -->
    <term name="graphic" form="short">graph.</term>
    <term name="interview" form="short">interv.</term>
    <term name="manuscript" form="short">MS</term>
    <term name="motion_picture" form="short">video rec.</term>
    <term name="report" form="short">rep.</term>
    <term name="review" form="short">rev.</term>
    <term name="review-book" form="short">bk. rev.</term>
    <term name="song" form="short">audio rec.</term>

    <!-- HISTORICAL ERA TERMS -->
    <term name="ad">AD</term>
    <term name="bc">BC</term>
    <term name="bce">BCE</term>
    <term name="ce">CE</term>

    <!-- PUNCTUATION -->
    <term name="open-quote">“</term>
    <term name="close-quote">”</term>
    <term name="open-inner-quote">‘</term>
    <term name="close-inner-quote">’</term>
    <term name="page-range-delimiter">–</term>
    <term name="colon">:</term>
    <term name="comma">,</term>
    <term name="semicolon">;</term>

    <!-- ORDINALS -->
    <term name="ordinal">th</term>
    <term name="ordinal-01">st</term>
    <term name="ordinal-02">nd</term>
    <term name="ordinal-03">rd</term>
    <term name="ordinal-11">th</term>
    <term name="ordinal-12">th</term>
    <term name="ordinal-13">th</term>

    <!-- LONG ORDINALS -->
    <term name="long-ordinal-01">first</term>
    <term name="long-ordinal-02">second</term>
    <term name="long-ordinal-03">third</term>
    <term name="long-ordinal-04">fourth</term>
    <term name="long-ordinal-05">fifth</term>
    <term name="long-ordinal-06">sixth</term>
    <term name="long-ordinal-07">seventh</term>
    <term name="long-ordinal-08">eighth</term>
    <term name="long-ordinal-09">ninth</term>
    <term name="long-ordinal-10">tenth</term>

    <!-- LONG LOCATOR FORMS -->
    <term name="act">			 
      <single>act</single>
      <multiple>acts</multiple>						 
    </term>
    <term name="appendix">			 
      <single>appendix</single>
      <multiple>appendices</multiple>						 
    </term>
    <term name="article-locator">			 
      <single>article</single>
      <multiple>articles</multiple>						 
    </term>
    <term name="canon">			 
      <single>canon</single>
      <multiple>canons</multiple>						 
    </term>
    <term name="elocation">			 
      <single>location</single>
      <multiple>locations</multiple>						 
    </term>
    <term name="equation">			 
      <single>equation</single>
      <multiple>equations</multiple>						 
    </term>
    <term name="rule">			 
      <single>rule</single>
      <multiple>rules</multiple>						 
    </term>
    <term name="scene">			 
      <single>scene</single>
      <multiple>scenes</multiple>						 
    </term>
    <term name="table">			 
      <single>table</single>
      <multiple>tables</multiple>						 
    </term>
    <term name="timestamp"> <!-- generally blank -->
      <single></single>
      <multiple></multiple>						 
    </term>
    <term name="title-locator">			 
      <single>title</single>
      <multiple>titles</multiple>						 
    </term>
    <term name="book">
      <single>book</single>
      <multiple>books</multiple>
    </term>
    <term name="chapter">
      <single>chapter</single>
      <multiple>chapters</multiple>
    </term>
    <term name="column">
      <single>column</single>
      <multiple>columns</multiple>
    </term>
    <term name="figure">
      <single>figure</single>
      <multiple>figures</multiple>
    </term>
    <term name="folio">
      <single>folio</single>
      <multiple>folios</multiple>
    </term>
    <term name="issue">
      <single>number</single>
      <multiple>numbers</multiple>
    </term>
    <term name="line">
      <single>line</single>
      <multiple>lines</multiple>
    </term>
    <term name="note">
      <single>note</single>
      <multiple>notes</multiple>
    </term>
    <term name="opus">
      <single>opus</single>
      <multiple>opera</multiple>
    </term>
    <term name="page">
      <single>page</single>
      <multiple>pages</multiple>
    </term>
    <term name="number-of-pages">
      <single>page</single>
      <multiple>pages</multiple>
    </term>
    <term name="paragraph">
      <single>paragraph</single>
      <multiple>paragraphs</multiple>
    </term>
    <term name="part">
      <single>part</single>
      <multiple>parts</multiple>
    </term>
    <term name="section">
      <single>section</single>
      <multiple>sections</multiple>
    </term>
    <term name="sub-verbo">
      <single>sub verbo</single>
      <multiple>sub verbis</multiple>
    </term>
    <term name="verse">
      <single>verse</single>
      <multiple>verses</multiple>
    </term>
    <term name="volume">
      <single>volume</single>
      <multiple>volumes</multiple>
    </term>

    <!-- SHORT LOCATOR FORMS -->
    <term name="appendix" form="short">			 
      <single>app.</single>
      <multiple>apps.</multiple>						 
    </term>
    <term name="article-locator" form="short">			 
      <single>art.</single>
      <multiple>arts.</multiple>
    </term>
    <term name="elocation" form="short">			 
      <single>loc.</single>
      <multiple>locs.</multiple>
    </term>
    <term name="equation" form="short">			 
      <single>eq.</single>
      <multiple>eqs.</multiple>
    </term>
    <term name="rule" form="short">			 
      <single>r.</single>
      <multiple>rr.</multiple>						 
    </term>
    <term name="scene" form="short">			 
      <single>sc.</single>
      <multiple>scs.</multiple>						 
    </term>
    <term name="table" form="short">			 
      <single>tbl.</single>
      <multiple>tbls.</multiple>						 
    </term>
    <term name="timestamp" form="short"> <!-- generally blank -->
      <single></single>
      <multiple></multiple>						 
    </term>
    <term name="title-locator" form="short">			 
      <single>tit.</single>
      <multiple>tits.</multiple>
    </term>
    <term name="book" form="short">
      <single>bk.</single>
      <multiple>bks.</multiple>
    </term>
    <term name="chapter" form="short">
      <single>chap.</single>
      <multiple>chaps.</multiple>
    </term>
    <term name="column" form="short">
      <single>col.</single>
      <multiple>cols.</multiple>
    </term>
    <term name="figure" form="short">
      <single>fig.</single>
      <multiple>figs.</multiple>
    </term>
    <term name="folio" form="short">
      <single>fol.</single>
      <multiple>fols.</multiple>
    </term>
    <term name="issue" form="short">
      <single>no.</single>
      <multiple>nos.</multiple>
    </term>
    <term name="line" form="short">
      <single>l.</single>
      <multiple>ll.</multiple>
    </term>
    <term name="note" form="short">
      <single>n.</single>
      <multiple>nn.</multiple>
    </term>
    <term name="opus" form="short">
      <single>op.</single>
      <multiple>opp.</multiple>
    </term>
    <term name="page" form="short">
      <single>p.</single>
      <multiple>pp.</multiple>
    </term>
    <term name="number-of-pages" form="short">
      <single>p.</single>
      <multiple>pp.</multiple>
    </term>
    <term name="paragraph" form="short">
      <single>para.</single>
      <multiple>paras.</multiple>
    </term>
    <term name="part" form="short">
      <single>pt.</single>
      <multiple>pts.</multiple>
    </term>
    <term name="section" form="short">
      <single>sec.</single>
      <multiple>secs.</multiple>
    </term>
    <term name="sub-verbo" form="short">
      <single>s.v.</single>
      <multiple>s.vv.</multiple>
    </term>
    <term name="verse" form="short">
      <single>v.</single>
      <multiple>vv.</multiple>
    </term>
    <term name="volume" form="short">
      <single>vol.</single>
      <multiple>vols.</multiple>
    </term>

    <!-- SYMBOL LOCATOR FORMS -->
    <term name="paragraph" form="symbol">
      <single>¶</single>
      <multiple>¶¶</multiple>
    </term>
    <term name="section" form="symbol">
      <single>§</single>
      <multiple>§§</multiple>
    </term>

    <!-- LONG ROLE FORMS -->
    <term name="chair">
      <single>chair</single>
      <multiple>chairs</multiple>
    </term>
    <term name="compiler">
      <single>compiler</single>
      <multiple>compilers</multiple>
    </term>
    <term name="contributor">
      <single>contributor</single>
      <multiple>contributors</multiple>
    </term>
    <term name="curator">
      <single>curator</single>
      <multiple>curators</multiple>
    </term>
    <term name="executive-producer">
      <single>executive producer</single>
      <multiple>executive producers</multiple>
    </term>
    <term name="guest">
      <single>guest</single>
      <multiple>guests</multiple>
    </term>
    <term name="host">
      <single>host</single>
      <multiple>hosts</multiple>
    </term>
    <term name="narrator">
      <single>narrator</single>
      <multiple>narrators</multiple>
    </term>
    <term name="organizer">
      <single>organizer</single>
      <multiple>organizers</multiple>
    </term>
    <term name="performer">
      <single>performer</single>
      <multiple>performers</multiple>
    </term>
    <term name="producer">
      <single>producer</single>
      <multiple>producers</multiple>
    </term>
    <term name="script-writer">
      <single>writer</single>
      <multiple>writers</multiple>
    </term>
    <term name="series-creator">
      <single>series creator</single>
      <multiple>series creators</multiple>
    </term>
    <term name="director">
      <single>director</single>
      <multiple>directors</multiple>
    </term>
    <term name="editor">
      <single>editor</single>
      <multiple>editors</multiple>
    </term>
    <term name="editorial-director">
      <single>editor</single>
      <multiple>editors</multiple>
    </term>
    <term name="illustrator">
      <single>illustrator</single>
      <multiple>illustrators</multiple>
    </term>
    <term name="translator">
      <single>translator</single>
      <multiple>translators</multiple>
    </term>
    <term name="editortranslator">
      <single>editor &amp; translator</single>
      <multiple>editors &amp; translators</multiple>
    </term>

    <!-- SHORT ROLE FORMS -->
    <term name="compiler" form="short">
      <single>comp.</single>
      <multiple>comps.</multiple>
    </term>
    <term name="contributor" form="short">
      <single>contrib.</single>
      <multiple>contribs.</multiple>
    </term>
    <term name="curator" form="short">
      <single>cur.</single>
      <multiple>curs.</multiple>
    </term>
    <term name="executive-producer" form="short">
      <single>exec. prod.</single>
      <multiple>exec. prods.</multiple>
    </term>
    <term name="narrator" form="short">
      <single>narr.</single>
      <multiple>narrs.</multiple>
    </term>
    <term name="organizer" form="short">
      <single>org.</single>
      <multiple>orgs.</multiple>
    </term>
    <term name="performer" form="short">
      <single>perf.</single>
      <multiple>perfs.</multiple>
    </term>
    <term name="producer" form="short">
      <single>prod.</single>
      <multiple>prods.</multiple>
    </term>
    <term name="script-writer" form="short">
      <single>writ.</single>
      <multiple>writs.</multiple>
    </term>
    <term name="series-creator" form="short">
      <single>cre.</single>
      <multiple>cres.</multiple>
    </term>
    <term name="director" form="short">
      <single>dir.</single>
      <multiple>dirs.</multiple>
    </term>
    <term name="editor" form="short">
      <single>ed.</single>
      <multiple>eds.</multiple>
    </term>
    <term name="editorial-director" form="short">
      <single>ed.</single>
      <multiple>eds.</multiple>
    </term>
    <term name="illustrator" form="short">
      <single>ill.</single>
      <multiple>ills.</multiple>
    </term>
    <term name="translator" form="short">
      <single>tran.</single>
      <multiple>trans.</multiple>
    </term>
    <term name="editortranslator" form="short">
      <single>ed. &amp; tran.</single>
      <multiple>eds. &amp; trans.</multiple>
    </term>

    <!-- VERB ROLE FORMS -->
    <term name="chair" form="verb">chaired by</term>
    <term name="compiler" form="verb">compiled by</term>
    <term name="contributor" form="verb">with</term>
    <term name="curator" form="verb">curated by</term>
    <term name="executive-producer" form="verb">executive produced by</term>
    <term name="guest" form="verb">with guest</term>
    <term name="host" form="verb">hosted by</term>
    <term name="narrator" form="verb">narrated by</term>
    <term name="organizer" form="verb">organized by</term>
    <term name="performer" form="verb">performed by</term>
    <term name="producer" form="verb">produced by</term>
    <term name="script-writer" form="verb">written by</term>
    <term name="series-creator" form="verb">created by</term>
    <term name="container-author" form="verb">by</term>
    <term name="director" form="verb">directed by</term>
    <term name="editor" form="verb">edited by</term>
    <term name="editorial-director" form="verb">edited by</term>
    <term name="illustrator" form="verb">illustrated by</term>
    <term name="interviewer" form="verb">interview by</term>
    <term name="recipient" form="verb">to</term>
    <term name="reviewed-author" form="verb">by</term>
    <term name="translator" form="verb">translated by</term>
    <term name="editortranslator" form="verb">edited &amp; translated by</term>

    <!-- SHORT VERB ROLE FORMS -->
    <term name="compiler" form="verb-short">comp. by</term>
    <term name="contributor" form="verb-short">w.</term>
    <term name="curator" form="verb-short">cur. by</term>
    <term name="executive-producer" form="verb-short">exec. prod. by</term>
    <term name="guest" form="verb-short">w. guest</term>
    <term name="host" form="verb-short">hosted by</term>
    <term name="narrator" form="verb-short">narr. by</term>
    <term name="organizer" form="verb-short">org. by</term>
    <term name="performer" form="verb-short">perf. by</term>
    <term name="producer" form="verb-short">prod. by</term>
    <term name="script-writer" form="verb-short">writ. by</term>
    <term name="series-creator" form="verb-short">cre. by</term>
    <term name="director" form="verb-short">dir. by</term>
    <term name="editor" form="verb-short">ed. by</term>
    <term name="editorial-director" form="verb-short">ed. by</term>
    <term name="illustrator" form="verb-short">illus. by</term>
    <term name="translator" form="verb-short">trans. by</term>
    <term name="editortranslator" form="verb-short">ed. &amp; trans. by</term>

    <!-- LONG MONTH FORMS -->
    <term name="month-01">January</term>
    <term name="month-02">February</term>
    <term name="month-03">March</term>
    <term name="month-04">April</term>
    <term name="month-05">May</term>
    <term name="month-06">June</term>
    <term name="month-07">July</term>
    <term name="month-08">August</term>
    <term name="month-09">September</term>
    <term name="month-10">October</term>
    <term name="month-11">November</term>
    <term name="month-12">December</term>

    <!-- SHORT MONTH FORMS -->
    <term name="month-01" form="short">Jan.</term>
    <term name="month-02" form="short">Feb.</term>
    <term name="month-03" form="short">Mar.</term>
    <term name="month-04" form="short">Apr.</term>
    <term name="month-05" form="short">May</term>
    <term name="month-06" form="short">Jun.</term>
    <term name="month-07" form="short">Jul.</term>
    <term name="month-08" form="short">Aug.</term>
    <term name="month-09" form="short">Sep.</term>
    <term name="month-10" form="short">Oct.</term>
    <term name="month-11" form="short">Nov.</term>
    <term name="month-12" form="short">Dec.</term>

    <!-- SEASONS -->
    <term name="season-01">Spring</term>
    <term name="season-02">Summer</term>
    <term name="season-03">Autumn</term>
    <term name="season-04">Winter</term>
  </terms>
</locale>
`

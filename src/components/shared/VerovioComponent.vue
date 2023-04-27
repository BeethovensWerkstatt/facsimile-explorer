<template>
  <div class="verovioComponent" :class="purpose" ref="mei">

  </div>
</template>

<script>
// import verovio from 'verovio'
// import { mapGetters } from 'vuex'

const verovioOptions = {
  scale: 40,
  breaks: 'none',
  openControlEvents: true,
  svgBoundingBoxes: true,
  svgRemoveXlink: true,
  header: 'none',
  footer: 'none' //,
  // unit: 18
}

const rawSelectables = [
  'note',
  'chord',
  'syl',
  'rest',
  'beam',
  'artic',
  'accid',
  'clef',
  'slur',
  'dynam',
  'dir'// ,
  // 'staff',
  // 'measure'
]
let selectables = []
rawSelectables.forEach(elem => {
  selectables.push('.' + elem + ':not(.bounding-box)')
})
selectables = selectables.join(', ')

export default {
  name: 'VerovioComponent',
  components: {

  },
  props: {
    purpose: String
  },
  methods: {
    render () {
      this.removeListeners()

      // TODO: Das ist ganz offensichtlich nicht der richtige Weg ;-)
      const mei = '<mei xmlns="http://www.music-encoding.org/ns/mei" meiversion="4.0.0"> <meiHead> <fileDesc> <titleStmt> <title>Crisantemi</title> <respStmt> <persName role="composer">Giacomo Puccini</persName> </respStmt> </titleStmt> <pubStmt></pubStmt> </fileDesc> <encodingDesc xml:id="encodingdesc-0000000707086629"> <appInfo xml:id="appinfo-0000000645338505"> <application xml:id="application-0000001260849453" isodate="2020-03-06T16:20:55" version="2.6.0-dev-34e89bb"> <name xml:id="name-0000000140111728">Verovio</name> <p xml:id="p-0000002019369344">Transcoded from MusicXML</p> </application> </appInfo> </encodingDesc> </meiHead> <music> <body> <mdiv xml:id="mdiv-0000001150083862"> <score xml:id="score-0000000349406986"> <scoreDef xml:id="scoredef-0000001527545709"> <staffGrp xml:id="staffgrp-0000000056438675"> <staffGrp xml:id="staffgrp-0000001463845395" symbol="bracket"> <staffDef xml:id="staffdef-0000002003966291" n="1" lines="5" ppq="12" clef.shape="G" clef.line="2" meter.count="3" meter.unit="4"> <label xml:id="label-0000000346988744">Violin I</label> <keySig xml:id="keysig-0000000825367834" sig="4s" /> <instrDef xml:id="instrdef-0000000025161925" midi.channel="0" midi.instrnum="40" midi.volume="78.00%" /> </staffDef> <staffDef xml:id="staffdef-0000001533271071" n="2" lines="5" ppq="12" clef.shape="G" clef.line="2" meter.count="3" meter.unit="4"> <label xml:id="label-0000000561423717">Violin II</label> <keySig xml:id="keysig-0000000593839843" sig="4s" /> <instrDef xml:id="instrdef-0000000267405022" midi.channel="3" midi.instrnum="40" midi.volume="78.00%" /> </staffDef> <staffDef xml:id="staffdef-0000000929493399" n="3" lines="5" ppq="12" clef.shape="C" clef.line="3" meter.count="3" meter.unit="4"> <label xml:id="label-0000000177077982">Viola</label> <keySig xml:id="keysig-0000000216120807" sig="4s" /> <instrDef xml:id="instrdef-0000001615262302" midi.channel="6" midi.instrnum="41" midi.volume="78.00%" /> </staffDef> <staffDef xml:id="staffdef-0000000183370630" n="4" lines="5" ppq="12" clef.shape="F" clef.line="4" meter.count="3" meter.unit="4"> <label xml:id="label-0000000335041670">Violoncello</label> <keySig xml:id="keysig-0000001747939867" sig="4s" /> <instrDef xml:id="instrdef-0000001653416503" midi.channel="10" midi.instrnum="42" midi.volume="78.00%" /> </staffDef> </staffGrp> </staffGrp> </scoreDef> <section xml:id="section-0000000631718026"> <pb xml:id="pb-0000001055314533" /> <measure xml:id="measure-0000001477853898" n="1"> <staff xml:id="staff-0000001261022864" n="1"> <layer xml:id="layer-0000001364464289" n="1"> <mRest xml:id="mrest-0000001589026604" /> </layer> </staff> <staff xml:id="staff-0000001130929271" n="2"> <layer xml:id="layer-0000001098209627" n="1"> <mRest xml:id="mrest-0000001216412978" /> </layer> </staff> <staff xml:id="staff-0000001482356049" n="3"> <layer xml:id="layer-0000000925079231" n="1"> <mRest xml:id="mrest-0000001344234745" /> </layer> </staff> <staff xml:id="staff-0000001494063327" n="4"> <layer xml:id="layer-0000001006516888" n="1"> <note xml:id="note-0000001544216216" dur.ppq="24" dur="2" oct="3" pname="g" stem.dir="down" accid.ges="s" /> <note xml:id="note-0000000623079682" dur.ppq="12" dur="4" oct="3" pname="g" stem.dir="down" accid.ges="s" /> </layer> </staff> <dir xml:id="dir-0000000090646777" place="above" staff="1" tstamp="1.000000" vgrp="200"> <rend xml:id="rend-0000000383189781" fontweight="bold">Andante Mesto</rend> </dir> <tempo xml:id="tempo-0000000290767988" place="above" staff="1" startid="#mrest-0000001589026604" mm="90" mm.unit="4"> <rend xml:id="rend-0000001298558047" fontname="VerovioText"></rend> = 90</tempo> <dynam xml:id="dynam-0000000292775554" place="below" staff="4" tstamp="1.000000" vgrp="200">pp</dynam> <dir xml:id="dir-0000001975537340" place="below" staff="4" tstamp="1.000000" vgrp="200">dolce</dir> <hairpin xml:id="hairpin-0000000811588533" staff="4" tstamp="1.000000" tstamp2="0m+4.0000" form="dim" place="below" vgrp="200" /> <tie xml:id="tie-0000000927595643" startid="#note-0000000623079682" endid="#note-0000000720748585" /> </measure> <measure xml:id="measure-0000001685792065" n="2"> <staff xml:id="staff-0000000658016858" n="1"> <layer xml:id="layer-0000000866733422" n="1"> <rest xml:id="rest-0000001720202416" dur.ppq="6" dur="8" /> <beam xml:id="beam-0000000271270556"> <note xml:id="note-0000000849365777" dur.ppq="6" dur="8" oct="4" pname="g" stem.dir="up" accid.ges="s"> <artic xml:id="artic-0000001815511890" artic="ten" /> </note> <note xml:id="note-0000001112587850" dur.ppq="6" dur="8" oct="4" pname="a" stem.dir="up"> <artic xml:id="artic-0000001106632845" artic="ten" /> </note> <note xml:id="note-0000000385440606" dur.ppq="6" dur="8" oct="4" pname="a" stem.dir="up"> <accid xml:id="accid-0000000964048325" accid="s" accid.ges="s" /> <artic xml:id="artic-0000000626194966" artic="ten" /> </note> <note xml:id="note-0000000220005157" dur.ppq="6" dur="8" oct="4" pname="b" stem.dir="up"> <artic xml:id="artic-0000002005357120" artic="ten" /> </note> <note xml:id="note-0000002080739299" dur.ppq="6" dur="8" oct="4" pname="b" stem.dir="up"> <accid xml:id="accid-0000000361517282" accid="s" accid.ges="s" /> </note> </beam> </layer> </staff> <staff xml:id="staff-0000000107996010" n="2"> <layer xml:id="layer-0000001236015461" n="1"> <rest xml:id="rest-0000000357118823" dur.ppq="6" dur="8" /> <beam xml:id="beam-0000001706697991"> <note xml:id="note-0000000573303406" dur.ppq="6" dur="8" oct="4" pname="f" stem.dir="up" accid.ges="s"> <artic xml:id="artic-0000001071479281" artic="ten" /> </note> <note xml:id="note-0000000450473904" dur.ppq="6" dur="8" oct="4" pname="f" stem.dir="up" accid.ges="s"> <artic xml:id="artic-0000000286712575" artic="ten" /> </note> <note xml:id="note-0000000618410358" dur.ppq="6" dur="8" oct="4" pname="g" stem.dir="up" accid.ges="s"> <artic xml:id="artic-0000000741518326" artic="ten" /> </note> <note xml:id="note-0000000015943450" dur.ppq="6" dur="8" oct="4" pname="g" stem.dir="up"> <accid xml:id="accid-0000001222963380" accid="n" /> <artic xml:id="artic-0000001632527358" artic="ten" /> </note> <note xml:id="note-0000002085527803" dur.ppq="6" dur="8" oct="4" pname="f" stem.dir="up" accid.ges="s"> <artic xml:id="artic-0000000585316656" artic="ten" /> </note> </beam> </layer> </staff> <staff xml:id="staff-0000000296791423" n="3"> <layer xml:id="layer-0000001014979894" n="1"> <rest xml:id="rest-0000001701827434" dur.ppq="6" dur="8" /> <beam xml:id="beam-0000002028824325"> <note xml:id="note-0000000699152902" dur.ppq="6" dur="8" oct="3" pname="b" stem.dir="up"> <accid xml:id="accid-0000000004981533" accid="s" accid.ges="s" /> <artic xml:id="artic-0000000285838223" artic="ten" /> </note> <note xml:id="note-0000000611847183" dur.ppq="6" dur="8" oct="4" pname="c" stem.dir="up" accid.ges="s"> <artic xml:id="artic-0000001145740400" artic="ten" /> </note> <note xml:id="note-0000002082340229" dur.ppq="6" dur="8" oct="4" pname="c" stem.dir="up"> <accid xml:id="accid-0000000467531894" accid="x" accid.ges="ss" /> <artic xml:id="artic-0000001359716600" artic="ten" /> </note> <note xml:id="note-0000000861921457" dur.ppq="6" dur="8" oct="4" pname="c" stem.dir="up"> <accid xml:id="accid-0000001784803309" accid="s" accid.ges="s" /> <artic xml:id="artic-0000000482566429" artic="ten" /> </note> <note xml:id="note-0000000223529693" dur.ppq="6" dur="8" oct="3" pname="g" stem.dir="up" accid.ges="s"> <artic xml:id="artic-0000000962700498" artic="ten" /> </note> </beam> </layer> </staff> <staff xml:id="staff-0000000780903593" n="4"> <layer xml:id="layer-0000001985968487" n="1"> <note xml:id="note-0000000720748585" dur.ppq="12" dur="4" oct="3" pname="g" stem.dir="down" accid.ges="s" /> <beam xml:id="beam-0000000328011349"> <note xml:id="note-0000002030003413" dur.ppq="6" dur="8" oct="3" pname="f" stem.dir="down" accid.ges="s"> <artic xml:id="artic-0000000001349858" artic="ten" /> </note> <note xml:id="note-0000000215399594" dur.ppq="6" dur="8" oct="3" pname="e" stem.dir="down"> <accid xml:id="accid-0000000317702905" accid="s" accid.ges="s" /> <artic xml:id="artic-0000001646479469" artic="ten" /> </note> <note xml:id="note-0000001668653449" dur.ppq="6" dur="8" oct="3" pname="e" stem.dir="down"> <accid xml:id="accid-0000001552113509" accid="n" /> <artic xml:id="artic-0000001821199379" artic="ten" /> </note> <note xml:id="note-0000000286468738" dur.ppq="6" dur="8" oct="3" pname="d" stem.dir="down" accid.ges="s"> <artic xml:id="artic-0000001363033530" artic="ten" /> </note> </beam> </layer> </staff> <dynam xml:id="dynam-0000000680284902" place="below" staff="1" tstamp="1.000000" vgrp="200">pp</dynam> <dir xml:id="dir-0000001682507095" place="below" staff="1" tstamp="1.500000" vgrp="200">dolce</dir> <slur xml:id="slur-0000001961372302" startid="#note-0000000849365777" endid="#note-0000000385440606" /> <dir xml:id="dir-0000000959498255" place="below" staff="1" tstamp="3.000000" vgrp="200">rit.</dir> <slur xml:id="slur-0000001631825097" startid="#note-0000000220005157" endid="#note-0000000469937273" curvedir="above" /> <dynam xml:id="dynam-0000000132438400" place="below" staff="2" tstamp="1.000000" vgrp="200">pp</dynam> <dir xml:id="dir-0000000809315094" place="below" staff="2" tstamp="1.500000" vgrp="200">dolce</dir> <slur xml:id="slur-0000002144242453" startid="#note-0000000573303406" endid="#note-0000000618410358" /> <slur xml:id="slur-0000001478591914" startid="#note-0000000573303406" endid="#note-0000000618410358" /> <dir xml:id="dir-0000001173431943" place="below" staff="2" tstamp="3.000000" vgrp="200">rit.</dir> <slur xml:id="slur-0000001114522957" startid="#note-0000000015943450" endid="#note-0000002136064561" /> <dynam xml:id="dynam-0000001300467260" place="below" staff="3" tstamp="1.000000" vgrp="200">pp</dynam> <dir xml:id="dir-0000000383591675" place="below" staff="3" tstamp="1.500000" vgrp="200">dolce</dir> <slur xml:id="slur-0000000038940864" startid="#note-0000000699152902" endid="#note-0000002082340229" /> <dir xml:id="dir-0000000513879420" place="below" staff="3" tstamp="3.000000" vgrp="200">rit.</dir> <slur xml:id="slur-0000002067215187" startid="#note-0000000861921457" endid="#note-0000000223529693" /> <slur xml:id="slur-0000001789996826" startid="#note-0000002030003413" endid="#note-0000000215399594" /> <dir xml:id="dir-0000000911896701" place="below" staff="4" tstamp="3.000000" vgrp="200">rit.</dir> <slur xml:id="slur-0000000659020531" startid="#note-0000001668653449" endid="#note-0000000286468738" /> </measure> <measure xml:id="measure-0000000188533487" n="3"> <staff xml:id="staff-0000001051416303" n="1"> <layer xml:id="layer-0000002078021099" n="1"> <note xml:id="note-0000000677155670" dur.ppq="12" dur="4" oct="5" pname="d" stem.dir="down" accid.ges="s" /> <note xml:id="note-0000000469937273" dur.ppq="12" dur="4" oct="5" pname="c" stem.dir="down" accid.ges="s" /> <beam xml:id="beam-0000001040097657"> <note xml:id="note-0000001076880328" dur.ppq="6" dur="8" oct="5" pname="g" stem.dir="down" accid.ges="s" /> <note xml:id="note-0000001772197264" dur.ppq="6" dur="8" oct="5" pname="e" stem.dir="down" /> </beam> </layer> </staff> <staff xml:id="staff-0000000445862616" n="2"> <layer xml:id="layer-0000001308764827" n="1"> <note xml:id="note-0000002136064561" dur.ppq="12" dur="4" oct="4" pname="e" stem.dir="up" /> <beam xml:id="beam-0000000303048924"> <note xml:id="note-0000000343905738" dur.ppq="6" dur="8" oct="4" pname="f" stem.dir="up" accid.ges="s" /> <note xml:id="note-0000000467404494" dur.ppq="6" dur="8" oct="4" pname="f" stem.dir="up"> <accid xml:id="accid-0000000153569336" accid="x" accid.ges="ss" /> </note> <note xml:id="note-0000002104355108" dur.ppq="6" dur="8" oct="4" pname="g" stem.dir="up"> <accid xml:id="accid-0000001887992070" accid="s" accid.ges="s" enclose="paren" /> </note> <note xml:id="note-0000001984651931" dur.ppq="3" dur="16" oct="4" pname="a" stem.dir="up" /> <note xml:id="note-0000000411286931" dur.ppq="3" dur="16" oct="4" pname="b" stem.dir="up"> <accid xml:id="accid-0000000043075140" accid="s" accid.ges="s" /> </note> </beam> </layer> </staff> <staff xml:id="staff-0000001421776227" n="3"> <layer xml:id="layer-0000000499054549" n="1"> <rest xml:id="rest-0000000193821603" dur.ppq="6" dur="8" /> <beam xml:id="beam-0000001071251038"> <note xml:id="note-0000001594265561" dur.ppq="6" dur="8" oct="3" pname="g" stem.dir="down" accid.ges="s" /> <note xml:id="note-0000001443313188" dur.ppq="6" dur="8" oct="3" pname="a" stem.dir="down" /> <note xml:id="note-0000000887743409" dur.ppq="6" dur="8" oct="4" pname="d" stem.dir="down" accid.ges="s" /> <note xml:id="note-0000000138308062" dur.ppq="6" dur="8" oct="4" pname="e" stem.dir="down" /> <note xml:id="note-0000000301370616" dur.ppq="3" dur="16" oct="4" pname="f" stem.dir="down" accid.ges="s" /> <note xml:id="note-0000001231400182" dur.ppq="3" dur="16" oct="4" pname="g" stem.dir="down" accid.ges="s" /> </beam> </layer> </staff> <staff xml:id="staff-0000001365438722" n="4"> <layer xml:id="layer-0000001025142302" n="1"> <note xml:id="note-0000002136519892" dots="1" dur.ppq="36" dur="2" oct="3" pname="c" stem.dir="up" accid.ges="s" /> </layer> </staff> <slur xml:id="slur-0000000567931660" startid="#note-0000001076880328" endid="#note-0000001772197264" /> <slur xml:id="slur-0000001084608909" startid="#note-0000000343905738" endid="#note-0000000467404494" /> <slur xml:id="slur-0000001781494223" startid="#note-0000002104355108" endid="#note-0000000411286931" /> <slur xml:id="slur-0000002066319154" startid="#note-0000001594265561" endid="#note-0000000887743409" /> <slur xml:id="slur-0000000862273695" startid="#note-0000000138308062" endid="#note-0000001231400182" /> </measure> <measure xml:id="measure-0000000298671928" n="4"> <staff xml:id="staff-0000000984414598" n="1"> <layer xml:id="layer-0000000999870707" n="1"> <note xml:id="note-0000001809258023" dur.ppq="12" dur="4" oct="5" pname="d" stem.dir="down" accid.ges="s" /> <note xml:id="note-0000000380724088" dur.ppq="12" dur="4" oct="5" pname="c" stem.dir="down" accid.ges="s" /> <beam xml:id="beam-0000001293730420"> <note xml:id="note-0000001537920490" dur.ppq="6" dur="8" oct="5" pname="c" stem.dir="up" accid.ges="s" /> <note xml:id="note-0000000131009913" dur.ppq="6" dur="8" oct="4" pname="g" stem.dir="up" accid.ges="s" /> </beam> </layer> </staff> <staff xml:id="staff-0000001662253469" n="2"> <layer xml:id="layer-0000000647473871" n="1"> <note xml:id="note-0000000720269441" dur.ppq="6" dur="8" oct="4" pname="g" stem.dir="up" accid.ges="s" /> <chord xml:id="chord-0000001038102063" dur.ppq="12" dur="4" cue="false" stem.dir="up"> <note xml:id="note-0000001090412781" oct="3" pname="g" accid.ges="s" /> <note xml:id="note-0000001564087505" oct="4" pname="g" accid.ges="s" /> </chord> <chord xml:id="chord-0000000452902206" dur.ppq="12" dur="4" cue="false" stem.dir="up"> <note xml:id="note-0000001842813665" oct="3" pname="g" accid.ges="s" /> <note xml:id="note-0000001837134084" oct="4" pname="g" accid.ges="s" /> </chord> <note xml:id="note-0000001055559504" dur.ppq="6" dur="8" oct="3" pname="g" stem.dir="up" accid.ges="s" /> </layer> </staff> <staff xml:id="staff-0000002043234849" n="3"> <layer xml:id="layer-0000001720251299" n="1"> <note xml:id="note-0000000175560750" dur.ppq="12" dur="4" oct="3" pname="b" stem.dir="up"> <accid xml:id="accid-0000002067940527" accid="s" accid.ges="s" /> </note> <note xml:id="note-0000001872237003" dur.ppq="12" dur="4" oct="4" pname="c" stem.dir="up" accid.ges="s" /> <note xml:id="note-0000001795277960" dur.ppq="12" dur="4" oct="3" pname="c" stem.dir="up" accid.ges="s" /> </layer> </staff> <staff xml:id="staff-0000001147389306" n="4"> <layer xml:id="layer-0000000028894269" n="1"> <note xml:id="note-0000000568512152" dur.ppq="24" dur="2" oct="3" pname="e" stem.dir="down" /> <note xml:id="note-0000000932778827" dur.ppq="12" dur="4" oct="2" pname="e" stem.dir="up" /> </layer> </staff> <slur xml:id="slur-0000000245555585" startid="#note-0000000380724088" endid="#note-0000001537920490" /> <slur xml:id="slur-0000001860667846" startid="#note-0000000131009913" endid="#note-0000001449196792" /> <slur xml:id="slur-0000001465855102" startid="#note-0000000175560750" endid="#note-0000001872237003" /> </measure> <sb xml:id="sb-0000001513953230" /> <measure xml:id="measure-0000000373547628" n="5"> <staff xml:id="staff-0000001959731054" n="1"> <layer xml:id="layer-0000001058495203" n="1"> <note xml:id="note-0000001449196792" dur.ppq="12" dur="4" oct="4" pname="b" stem.dir="down" /> <beam xml:id="beam-0000001177725710"> <note xml:id="note-0000000365550806" dur.ppq="3" dur="16" oct="4" pname="a" stem.dir="up"> <artic xml:id="artic-0000001331461084" artic="ten" /> </note> <note xml:id="note-0000001524120063" dur.ppq="3" dur="16" oct="4" pname="b" stem.dir="up"> <artic xml:id="artic-0000000303569764" artic="ten" /> </note> <note xml:id="note-0000001352735637" dur.ppq="3" dur="16" oct="4" pname="g" stem.dir="up" accid.ges="s"> <artic xml:id="artic-0000002032652924" artic="ten" /> </note> <note xml:id="note-0000001888237247" dur.ppq="3" dur="16" oct="4" pname="a" stem.dir="up"> <artic xml:id="artic-0000001195285187" artic="ten" /> </note> </beam> <beam xml:id="beam-0000000079490739"> <note xml:id="note-0000002113663388" dur.ppq="6" dur="8" oct="4" pname="b" stem.dir="down" /> <note xml:id="note-0000001922299161" dur.ppq="6" dur="8" oct="5" pname="c" stem.dir="down" accid.ges="s" /> </beam> </layer> </staff> <staff xml:id="staff-0000001988410283" n="2"> <layer xml:id="layer-0000000156816563" n="1"> <note xml:id="note-0000000835076158" dur.ppq="24" dur="2" oct="4" pname="c" stem.dir="up" accid.ges="s" /> <note xml:id="note-0000000700718598" dur.ppq="12" dur="4" oct="4" pname="f" stem.dir="up" accid.ges="s" /> </layer> </staff> <staff xml:id="staff-0000001152097288" n="3"> <layer xml:id="layer-0000000305268363" n="1"> <rest xml:id="rest-0000000543450921" dur.ppq="6" dur="8" /> <beam xml:id="beam-0000001966281618"> <note xml:id="note-0000000030947030" dur.ppq="6" dur="8" oct="3" pname="c" stem.dir="up" accid.ges="s" /> <note xml:id="note-0000001582970967" dur.ppq="6" dur="8" oct="3" pname="f" stem.dir="up" accid.ges="s" /> <note xml:id="note-0000001356866099" dur.ppq="6" dur="8" oct="3" pname="g" stem.dir="up" accid.ges="s" /> </beam> <beam xml:id="beam-0000000425754850"> <note xml:id="note-0000000578108853" dur.ppq="3" dur="16" oct="3" pname="a" stem.dir="up"> <artic xml:id="artic-0000001703427123" artic="ten" /> </note> <note xml:id="note-0000000857530766" dur.ppq="3" dur="16" oct="3" pname="b" stem.dir="up"> <accid xml:id="accid-0000000347818989" accid="n" enclose="paren" /> <artic xml:id="artic-0000002008701336" artic="ten" /> </note> <note xml:id="note-0000001665778398" dur.ppq="3" dur="16" oct="3" pname="g" stem.dir="up" accid.ges="s"> <artic xml:id="artic-0000000626650997" artic="ten" /> </note> <note xml:id="note-0000001325569203" dur.ppq="3" dur="16" oct="3" pname="a" stem.dir="up"> <artic xml:id="artic-0000001311999105" artic="ten" /> </note> </beam> </layer> </staff> <staff xml:id="staff-0000000254059590" n="4"> <layer xml:id="layer-0000000820004050" n="1"> <note xml:id="note-0000001811111709" dots="1" dur.ppq="18" dur="4" oct="2" pname="f" stem.dir="up" accid.ges="s" /> <note xml:id="note-0000001968689438" dur.ppq="6" dur="8" oct="2" pname="e" stem.dir="up" /> <note xml:id="note-0000001571981983" dur.ppq="12" dur="4" oct="2" pname="d" stem.dir="up" accid.ges="s" /> </layer> </staff> <slur xml:id="slur-0000000810413238" startid="#note-0000000365550806" endid="#note-0000001888237247" /> <slur xml:id="slur-0000000577921322" startid="#note-0000002113663388" endid="#note-0000001313151300" /> <tie xml:id="tie-0000001451846672" startid="#note-0000001922299161" endid="#note-0000000287587938" /> <slur xml:id="slur-0000000537113516" startid="#note-0000000030947030" endid="#note-0000001356866099" /> <slur xml:id="slur-0000000369741965" startid="#note-0000000578108853" endid="#note-0000001325569203" /> <tie xml:id="tie-0000000300587602" startid="#note-0000001325569203" endid="#note-0000000815584205" /> </measure> </section> </score> </mdiv> </body> </music> </mei>'
      this.vrvToolkit.loadData(mei)
      const svg = this.vrvToolkit.renderToSVG(1, {})

      this.$refs.mei.innerHTML = svg

      this.addListeners()
    },
    removeListeners () {
      this.$refs.mei.removeEventListener('click', this.clickListener)
    },
    addListeners () {
      this.$refs.mei.addEventListener('click', this.clickListener)
    },
    clickListener (e) {
      const target = e.target.closest(selectables)
      if (target !== null) {
        // TODO: Hier müssen wir auf this.purpose reagieren und unterschiedliche
        // Aktionen ausführen. Hier erstmal nur zur Anschauung – das müsste
        // natürlich über die Daten koordiniert werden…
        target.classList.toggle('supplied')
      }
    }
  },
  computed: {

  },
  mounted: function () {
    // eslint-disable-next-line
    // this.vrvToolkit = new verovio.toolkit()
    this.$store.getters.verovioToolkit().then(tk => {
      this.vrvToolkit = tk
      this.vrvToolkit.setOptions(verovioOptions)
      this.render()
    })
    /*
    this.unwatchPageXML = this.$store.watch((state, getters) => getters.xmlCode,
      (newCode, oldCode) => {
        this.render()
      })
     */
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
@import '@/css/_variables.scss';

.verovioComponent {
  margin: .5rem;
  padding: .5rem;
  border: $lightBorder;
  border-radius: .3rem;
  background-color: #ffffff;
  box-shadow: 0 0 .3rem #00000066 inset;
  max-height: calc(100% - 1rem);
  overflow: auto;

  svg .supplied {
    fill: $svgSuppliedColor;
    stroke: $svgSuppliedColor;
  }
}

</style>

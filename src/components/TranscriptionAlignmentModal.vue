<template>
  <div class="modal modal-lg" :class="{ active }" id="transcriptionAlignment-modal">
    <a href="#close" @click="closeModal()" class="modal-overlay" aria-label="Close"></a>
    <div class="modal-container">
      <div class="modal-header">
        <a href="#close" @click="closeModal()" class="btn btn-clear float-right" aria-label="Close"></a>
        <div class="modal-title h5">Overview</div>
      </div>
      <div class="modal-body">
        <div class="content">
          <splitpanes class="default-theme">
            <pane size="75" max-size="90" min-size="75">
              <h1>Annotated Transcript</h1>
              <div class="annotated transcript">
                 <!--<svg width="1516.8px" height="372.8px" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:mei="http://www.music-encoding.org/ns/mei" overflow="visible">
                  <desc>Engraved by Verovio 3.13.0-dev-efb0c61</desc>
                  <defs>
                     <symbol id="E062-ach4j0" viewBox="0 0 1000 1000" overflow="inherit">
                        <path transform="scale(1,-1)" d="M582 -120c0 32 26 58 58 58s58 -26 58 -58s-26 -58 -58 -58s-58 26 -58 58zM582 120c0 32 26 58 58 58s58 -26 58 -58s-26 -58 -58 -58s-58 26 -58 58zM158 96c51 0 73 -14 88 -49l16 -39c0 -17 -2 -30 -7 -40c-3 -11 -10 -21 -19 -31c-17 -18 -49 -43 -84 -43 c-55 0 -77 13 -112 44c-24 21 -35 55 -35 100c0 46 14 81 32 112c30 52 71 79 137 93l36 6l26 2c154 0 235 -68 274 -182c11 -32 18 -68 18 -107c0 -103 -26 -182 -68 -250c-89 -145 -234 -230 -412 -288l-30 -5c-9 0 -14 3 -14 8c3 10 5 11 10 16c35 15 70 30 96 44l78 43 c96 57 162 136 197 258c9 33 17 60 22 100c3 22 5 35 6 39c-7 69 -16 115 -23 140s-4 22 -16 40c-8 12 -19 23 -31 34c-24 21 -62 44 -118 44c-48 0 -84 -8 -113 -28c-28 -19 -42 -44 -42 -73v-16c2 -5 3 -9 4 -11c24 22 52 39 84 39z"/>
                     </symbol>
                     <symbol id="E050-ach4j0" viewBox="0 0 1000 1000" overflow="inherit">
                        <path transform="scale(1,-1)" d="M441 -245c-23 -4 -48 -6 -76 -6c-59 0 -102 7 -130 20c-88 42 -150 93 -187 154c-26 44 -43 103 -48 176c0 6 -1 13 -1 19c0 54 15 111 45 170c29 57 65 106 110 148s96 85 153 127c-3 16 -8 46 -13 92c-4 43 -5 73 -5 89c0 117 16 172 69 257c34 54 64 82 89 82 c21 0 43 -30 69 -92s39 -115 41 -159v-15c0 -109 -21 -162 -67 -241c-13 -20 -63 -90 -98 -118c-13 -9 -25 -19 -37 -29l31 -181c8 1 18 2 28 2c58 0 102 -12 133 -35c59 -43 92 -104 98 -184c1 -7 1 -15 1 -22c0 -123 -87 -209 -181 -248c8 -57 17 -110 25 -162 c5 -31 6 -58 6 -80c0 -30 -5 -53 -14 -70c-35 -64 -88 -99 -158 -103c-5 0 -11 -1 -16 -1c-37 0 -72 10 -108 27c-50 24 -77 59 -80 105v11c0 29 7 55 20 76c18 28 45 42 79 44h6c49 0 93 -42 97 -87v-9c0 -51 -34 -86 -105 -106c17 -24 51 -36 102 -36c62 0 116 43 140 85 c9 16 13 41 13 74c0 20 -1 42 -5 67c-8 53 -18 106 -26 159zM461 939c-95 0 -135 -175 -135 -286c0 -24 2 -48 5 -71c50 39 92 82 127 128c40 53 60 100 60 140v8c-4 53 -22 81 -55 81h-2zM406 119l54 -326c73 25 110 78 110 161c0 7 0 15 -1 23c-7 95 -57 142 -151 142h-12 zM382 117c-72 -2 -128 -47 -128 -120v-7c2 -46 43 -99 75 -115c-3 -2 -7 -5 -10 -10c-70 33 -116 88 -123 172v11c0 68 44 126 88 159c23 17 49 29 78 36l-29 170c-21 -13 -52 -37 -92 -73c-50 -44 -86 -84 -109 -119c-45 -69 -67 -130 -67 -182v-13c5 -68 35 -127 93 -176 s125 -73 203 -73c25 0 50 3 75 9c-19 111 -36 221 -54 331z"/>
                     </symbol>
                     <symbol id="E082-ach4j0" viewBox="0 0 1000 1000" overflow="inherit">
                        <path transform="scale(1,-1)" d="M124 -185c-18 0 -55 -14 -65 -65h-36l-3 30c0 25 6 45 18 63c11 19 22 30 39 43l121 82l37 29c15 11 27 29 38 54c12 24 18 47 18 70c0 40 -19 88 -94 88c-25 0 -32 0 -50 -8c-14 -5 -23 -12 -26 -22c3 -9 7 -15 10 -18l24 -17c12 -7 17 -11 27 -21c5 -7 7 -16 7 -27 c0 -12 0 -57 -79 -74c-30 0 -76 26 -76 94c0 66 81 135 197 135c72 0 181 -32 181 -150c0 -53 -32 -95 -113 -133l-91 -41c-26 -11 -45 -23 -57 -37l49 7c84 0 115 -41 148 -41c20 0 33 20 39 61h35c0 -152 -68 -168 -114 -168c-17 0 -65 0 -79 7h10l-28 17 c-49 37 -69 40 -87 42z"/>
                     </symbol>
                     <symbol id="E084-ach4j0" viewBox="0 0 1000 1000" overflow="inherit">
                        <path transform="scale(1,-1)" d="M20 -78c84 97 114 180 134 329h170c-13 -32 -82 -132 -99 -151l-84 -97c-33 -36 -59 -63 -80 -81h162v102l127 123v-225h57v-39h-57v-34c0 -43 19 -65 57 -65v-34h-244v36c48 0 60 26 60 70v27h-203v39z"/>
                     </symbol>
                     <symbol id="E0A3-ach4j0" viewBox="0 0 1000 1000" overflow="inherit">
                        <path transform="scale(1,-1)" d="M278 64c0 22 -17 39 -43 39c-12 0 -26 -3 -41 -10c-85 -43 -165 -94 -165 -156c5 -25 15 -32 49 -32c67 11 200 95 200 159zM0 -36c0 68 73 174 200 174c66 0 114 -39 114 -97c0 -84 -106 -173 -218 -173c-64 0 -96 32 -96 96z"/>
                     </symbol>
                     <symbol id="E0A4-ach4j0" viewBox="0 0 1000 1000" overflow="inherit">
                        <path transform="scale(1,-1)" d="M0 -39c0 68 73 172 200 172c66 0 114 -37 114 -95c0 -84 -106 -171 -218 -171c-64 0 -96 30 -96 94z"/>
                     </symbol>
                     <symbol id="E240-ach4j0" viewBox="0 0 1000 1000" overflow="inherit">
                        <path transform="scale(1,-1)" d="M179 -646c15 29 29 55 46 102c18 49 30 108 30 138c0 105 -80 173 -168 200c-18 5 -47 9 -87 16v190h22c8 0 33 -61 71 -95c4 -3 -2 3 61 -56c62 -58 122 -137 122 -241c0 -38 -13 -106 -35 -163c-20 -51 -43 -99 -66 -132c-6 -5 -10 -7 -13 -7s-5 2 -5 5l4 10 c1 3 14 25 18 33z"/>
                     </symbol>
                     <symbol id="E241-ach4j0" viewBox="0 0 1000 1000" overflow="inherit">
                        <path transform="scale(1,-1)" d="M179 646c-4 8 -17 30 -18 33l-4 10c0 3 2 5 5 5s7 -2 13 -7c23 -33 46 -81 66 -132c22 -57 35 -125 35 -163c0 -104 -60 -183 -122 -241c-63 -59 -57 -53 -61 -56c-38 -34 -63 -95 -71 -95h-22v190c40 7 69 11 87 16c88 27 168 95 168 200c0 30 -12 89 -30 138 c-17 47 -31 73 -46 102z"/>
                     </symbol>
                     <symbol id="E261-ach4j0" viewBox="0 0 1000 1000" overflow="inherit">
                        <path transform="scale(1,-1)" d="M0 -188v539h18v-191l139 22v-533h-17v186zM18 -100l122 17v176l-122 -19v-174z"/>
                     </symbol>
                     <symbol id="E262-ach4j0" viewBox="0 0 1000 1000" overflow="inherit">
                        <path transform="scale(1,-1)" d="M136 186v169h17v-164l44 14v-91l-44 -14v-165l44 12v-91l-44 -13v-155h-17v150l-76 -22v-155h-17v149l-43 -13v90l43 14v167l-43 -14v92l43 13v169h17v-163zM60 73v-167l76 22v168z"/>
                     </symbol>
                  </defs>
                  <svg class="definition-scale" color="black" viewBox="0 0 18960 4660">
                     <g class="page-margin" transform="translate(500, 500)">
                        <g id="m13kbkho" class="mdiv pageMilestone"/>
                        <g id="s14toj8d" class="score pageMilestone"/>
                        <g id="s812yw6" class="system">
                           <path d="M1802 540 L1802 3120" stroke="currentColor" stroke-width="27"/>
                           <g id="gqsmcut" class="grpSym">
                              <path d="M1717,3102 C1357,2562 1807,2010 1537,1830 C1870,2010 1420,2562 1717,3102" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="18"/>
                              <path d="M1717,558 C1420,1098 1870,1650 1537,1830 C1807,1650 1357,1098 1717,558" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="18"/>
                           </g>
                           <g id="l21hm6n" class="label">
                              <text x="1384" y="1920" text-anchor="end" font-size="0px">
                                 <tspan id="tvbiru8" class="text">
                                    <tspan font-size="405px" class="text">Klavier</tspan>
                                 </tspan>
                              </text>
                           </g>
                           <g id="s1rxu42b" class="section systemMilestone"/>
                           <g id="p141d4kl" class="pb"/>
                           <g id="m1wmdwke" class="measure">
                              <g id="sulza8l" class="staff">
                                 <path d="M1789 540 L6106 540" stroke="currentColor" stroke-width="13"/>
                                 <path d="M1789 720 L6106 720" stroke="currentColor" stroke-width="13"/>
                                 <path d="M1789 900 L6106 900" stroke="currentColor" stroke-width="13"/>
                                 <path d="M1789 1080 L6106 1080" stroke="currentColor" stroke-width="13"/>
                                 <path d="M1789 1260 L6106 1260" stroke="currentColor" stroke-width="13"/>
                                 <g id="c1bocnbe" class="clef" fill="#000000">
                                    <use xlink:href="#E050-ach4j0" x="1906" y="1080" height="720px" width="720px"/>
                                 </g>
                                 <g id="k115iekq" class="keySig">
                                    <g id="k5vyo0k" class="keyAccid">
                                       <use xlink:href="#E262-ach4j0" x="2587" y="540" height="720px" width="720px"/>
                                    </g>
                                    <g id="k1fv3r0j" class="keyAccid">
                                       <use xlink:href="#E262-ach4j0" x="2765" y="810" height="720px" width="720px"/>
                                    </g>
                                    <g id="kuudegg" class="keyAccid">
                                       <use xlink:href="#E262-ach4j0" x="2943" y="450" height="720px" width="720px"/>
                                    </g>
                                    <g id="k1gvr6lb" class="keyAccid">
                                       <use xlink:href="#E262-ach4j0" x="3121" y="720" height="720px" width="720px"/>
                                    </g>
                                 </g>
                                 <g id="m1ds762b" class="meterSig">
                                    <use xlink:href="#E082-ach4j0" x="3428" y="720" height="720px" width="720px"/>
                                    <use xlink:href="#E084-ach4j0" x="3433" y="1080" height="720px" width="720px"/>
                                 </g>
                                 <g id="l1m0mess" class="layer">
                                    <g id="n1p24wxs" class="note" fill="#000000">
                                       <g class="notehead">
                                          <use xlink:href="#E0A4-ach4j0" x="4187" y="990" height="720px" width="720px"/>
                                       </g>
                                       <g id="s1qcown" class="stem">
                                          <rect x="4395" y="360" height="602" width="18"/>
                                       </g>
                                    </g>
                                    <g id="n13pbmfs" class="note" fill="#000000">
                                       <g class="notehead">
                                          <use xlink:href="#E0A4-ach4j0" x="5133" y="1080" height="720px" width="720px"/>
                                       </g>
                                       <g id="s36ko84" class="stem">
                                          <rect x="5341" y="450" height="602" width="18"/>
                                       </g>
                                       <g id="a10lpnkx" class="accid"/>
                                    </g>
                                 </g>
                                 <g id="l1lrskon" class="layer">
                                    <g id="nadez6d" class="note" fill="#000000">
                                       <g class="notehead">
                                          <use xlink:href="#E0A4-ach4j0" x="4187" y="1170" height="720px" width="720px"/>
                                       </g>
                                       <g id="s12fv9ip" class="stem">
                                          <rect x="4187" y="1198" height="512" width="18"/>
                                          <g id="f4cxm3v" class="flag">
                                             <use xlink:href="#E241-ach4j0" x="4187" y="1710" height="720px" width="720px"/>
                                          </g>
                                       </g>
                                       <g id="a14d20b7" class="accid"/>
                                    </g>
                                    <g id="n8ijgrk" class="note" fill="#000000">
                                       <g class="notehead">
                                          <use xlink:href="#E0A4-ach4j0" x="4683" y="1350" height="720px" width="720px"/>
                                       </g>
                                       <g id="s1o4pfe3" class="stem">
                                          <rect x="4683" y="1378" height="422" width="18"/>
                                       </g>
                                       <g id="a11siwgj" class="accid"/>
                                    </g>
                                    <g id="nvx5ig2" class="note" fill="#000000">
                                       <g class="notehead">
                                          <use xlink:href="#E0A4-ach4j0" x="5583" y="1260" height="720px" width="720px"/>
                                       </g>
                                       <g id="svxvwle" class="stem">
                                          <rect x="5583" y="1288" height="512" width="18"/>
                                          <g id="fzyawh2" class="flag">
                                             <use xlink:href="#E241-ach4j0" x="5583" y="1800" height="720px" width="720px"/>
                                          </g>
                                       </g>
                                    </g>
                                 </g>
                              </g>
                              <g id="sjnp16n" class="staff">
                                 <path d="M1789 2400 L6106 2400" stroke="currentColor" stroke-width="13"/>
                                 <path d="M1789 2580 L6106 2580" stroke="currentColor" stroke-width="13"/>
                                 <path d="M1789 2760 L6106 2760" stroke="currentColor" stroke-width="13"/>
                                 <path d="M1789 2940 L6106 2940" stroke="currentColor" stroke-width="13"/>
                                 <path d="M1789 3120 L6106 3120" stroke="currentColor" stroke-width="13"/>
                                 <g id="cg5bvzp" class="clef" fill="#000000">
                                    <use xlink:href="#E062-ach4j0" x="1906" y="2580" height="720px" width="720px"/>
                                 </g>
                                 <g id="kd50ues" class="keySig">
                                    <g id="k14ydbfn" class="keyAccid">
                                       <use xlink:href="#E262-ach4j0" x="2587" y="2580" height="720px" width="720px"/>
                                    </g>
                                    <g id="k1mjkar" class="keyAccid">
                                       <use xlink:href="#E262-ach4j0" x="2765" y="2850" height="720px" width="720px"/>
                                    </g>
                                    <g id="k5be1ru" class="keyAccid">
                                       <use xlink:href="#E262-ach4j0" x="2943" y="2490" height="720px" width="720px"/>
                                    </g>
                                    <g id="k1i0gop6" class="keyAccid">
                                       <use xlink:href="#E262-ach4j0" x="3121" y="2760" height="720px" width="720px"/>
                                    </g>
                                 </g>
                                 <g id="m5uc35x" class="meterSig">
                                    <use xlink:href="#E082-ach4j0" x="3428" y="2580" height="720px" width="720px"/>
                                    <use xlink:href="#E084-ach4j0" x="3433" y="2940" height="720px" width="720px"/>
                                 </g>
                                 <g id="l1l9ijro" class="layer">
                                    <g id="n162dh4z" class="note" fill="#000000">
                                       <g class="notehead">
                                          <use xlink:href="#E0A4-ach4j0" x="4187" y="2760" height="720px" width="720px"/>
                                       </g>
                                       <g id="s10ra5it" class="stem">
                                          <rect x="4395" y="2160" height="572" width="18"/>
                                          <g id="f1cbhguv" class="flag">
                                             <use xlink:href="#E240-ach4j0" x="4395" y="2160" height="720px" width="720px"/>
                                          </g>
                                       </g>
                                       <g id="a1cprrsh" class="accid"/>
                                    </g>
                                    <g id="n152k4pc" class="note" fill="#000000">
                                       <g class="notehead">
                                          <use xlink:href="#E0A4-ach4j0" x="4683" y="2580" height="720px" width="720px"/>
                                       </g>
                                       <g id="s1z0n6k" class="stem">
                                          <rect x="4891" y="2040" height="512" width="18"/>
                                       </g>
                                       <g id="as9d8wo" class="accid"/>
                                    </g>
                                    <g id="ny9pv0d" class="note" fill="#000000">
                                       <g class="notehead">
                                          <use xlink:href="#E0A4-ach4j0" x="5583" y="2670" height="720px" width="720px"/>
                                       </g>
                                       <g id="soqfog1" class="stem">
                                          <rect x="5791" y="2100" height="542" width="18"/>
                                          <g id="f1r7cvd6" class="flag">
                                             <use xlink:href="#E240-ach4j0" x="5791" y="2100" height="720px" width="720px"/>
                                          </g>
                                       </g>
                                    </g>
                                 </g>
                                 <g id="ltgfhdt" class="layer">
                                    <g id="ng5055c" class="note" fill="#000000">
                                       <g class="notehead">
                                          <use xlink:href="#E0A4-ach4j0" x="4187" y="2940" height="720px" width="720px"/>
                                       </g>
                                       <g id="sbzm8yx" class="stem">
                                          <rect x="4187" y="2968" height="512" width="18"/>
                                       </g>
                                       <g id="atf9mh0" class="accid">
                                          <use xlink:href="#E262-ach4j0" x="4001" y="2940" height="720px" width="720px"/>
                                       </g>
                                    </g>
                                    <g id="n1gn7pc" class="note" fill="#000000">
                                       <g class="notehead">
                                          <use xlink:href="#E0A4-ach4j0" x="5133" y="2850" height="720px" width="720px"/>
                                       </g>
                                       <g id="s1b87aay" class="stem">
                                          <rect x="5133" y="2878" height="542" width="18"/>
                                       </g>
                                       <g id="a1ukh3rp" class="accid"/>
                                    </g>
                                 </g>
                              </g>
                              <g id="t1e1ndkw" class="tie">
                                 <path d="M5854,1305 C6006,1411 6273,1411 6427,1305 C6292,1460 5987,1460 5854,1305" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="9"/>
                              </g>
                              <g id="b1jrdi2q" class="barLine">
                                 <path d="M6093 540 L6093 1260" stroke="currentColor" stroke-width="27"/>
                                 <path d="M6093 2400 L6093 3120" stroke="currentColor" stroke-width="27"/>
                                 <path d="M6093 1260 L6093 2400" stroke="currentColor" stroke-width="27"/>
                              </g>
                           </g>
                           <g id="mbg8f1q" class="measure">
                              <g id="s1qo5127" class="staff">
                                 <path d="M6106 540 L8549 540" stroke="currentColor" stroke-width="13"/>
                                 <path d="M6106 720 L8549 720" stroke="currentColor" stroke-width="13"/>
                                 <path d="M6106 900 L8549 900" stroke="currentColor" stroke-width="13"/>
                                 <path d="M6106 1080 L8549 1080" stroke="currentColor" stroke-width="13"/>
                                 <path d="M6106 1260 L8549 1260" stroke="currentColor" stroke-width="13"/>
                                 <g class="ledgerLines below">
                                    <path d="M7078 1440 L7400 1440" stroke="currentColor" stroke-width="22"/>
                                 </g>
                                 <g id="l102gjrs" class="layer">
                                    <g id="n1l6cnm9" class="note" fill="#000000">
                                       <g class="notehead">
                                          <use xlink:href="#E0A4-ach4j0" x="6472" y="1080" height="720px" width="720px"/>
                                       </g>
                                       <g id="submmcv" class="stem">
                                          <rect x="6680" y="450" height="602" width="18"/>
                                       </g>
                                       <g id="avyb2o9" class="accid">
                                          <use xlink:href="#E261-ach4j0" x="6314" y="1080" height="720px" width="720px"/>
                                       </g>
                                    </g>
                                    <g id="nzfif1p" class="note" fill="#000000">
                                       <g class="notehead">
                                          <use xlink:href="#E0A4-ach4j0" x="7576" y="1170" height="720px" width="720px"/>
                                       </g>
                                       <g id="s1hcuduv" class="stem">
                                          <rect x="7784" y="540" height="602" width="18"/>
                                       </g>
                                       <g id="aouqqe5" class="accid"/>
                                    </g>
                                 </g>
                                 <g id="lzwrrmp" class="layer">
                                    <g id="nm4rjcf" class="note" fill="#000000">
                                       <g class="notehead">
                                          <use xlink:href="#E0A4-ach4j0" x="6472" y="1260" height="720px" width="720px"/>
                                       </g>
                                       <g id="slj5enf" class="stem">
                                          <rect x="6472" y="1288" height="512" width="18"/>
                                          <g id="f1coxs6e" class="flag">
                                             <use xlink:href="#E241-ach4j0" x="6472" y="1800" height="720px" width="720px"/>
                                          </g>
                                       </g>
                                    </g>
                                    <g id="nx7ru" class="note" fill="#000000">
                                       <g class="notehead">
                                          <use xlink:href="#E0A4-ach4j0" x="7126" y="1440" height="720px" width="720px"/>
                                       </g>
                                       <g id="s8i0420" class="stem">
                                          <rect x="7126" y="1468" height="422" width="18"/>
                                       </g>
                                       <g id="a1t36zkf" class="accid"/>
                                    </g>
                                    <g id="n1h2bwnz" class="note" fill="#000000">
                                       <g class="notehead">
                                          <use xlink:href="#E0A4-ach4j0" x="8026" y="1350" height="720px" width="720px"/>
                                       </g>
                                       <g id="s15b4rv3" class="stem">
                                          <rect x="8026" y="1378" height="512" width="18"/>
                                          <g id="f610xnm" class="flag">
                                             <use xlink:href="#E241-ach4j0" x="8026" y="1890" height="720px" width="720px"/>
                                          </g>
                                       </g>
                                       <g id="a1efo2gt" class="accid"/>
                                    </g>
                                 </g>
                              </g>
                              <g id="s1lujq7v" class="staff">
                                 <path d="M6106 2400 L8549 2400" stroke="currentColor" stroke-width="13"/>
                                 <path d="M6106 2580 L8549 2580" stroke="currentColor" stroke-width="13"/>
                                 <path d="M6106 2760 L8549 2760" stroke="currentColor" stroke-width="13"/>
                                 <path d="M6106 2940 L8549 2940" stroke="currentColor" stroke-width="13"/>
                                 <path d="M6106 3120 L8549 3120" stroke="currentColor" stroke-width="13"/>
                                 <g id="lv2hvpn" class="layer">
                                    <g id="n1ne4hh9" class="note" fill="#000000">
                                       <g class="notehead">
                                          <use xlink:href="#E0A4-ach4j0" x="6472" y="2850" height="720px" width="720px"/>
                                       </g>
                                       <g id="s4xu51f" class="stem">
                                          <rect x="6680" y="2220" height="602" width="18"/>
                                          <g id="f1uptnz7" class="flag">
                                             <use xlink:href="#E240-ach4j0" x="6680" y="2220" height="720px" width="720px"/>
                                          </g>
                                       </g>
                                       <g id="a1up9lny" class="accid"/>
                                    </g>
                                    <g id="ndc1cks" class="note" fill="#000000">
                                       <g class="notehead">
                                          <use xlink:href="#E0A4-ach4j0" x="7126" y="2670" height="720px" width="720px"/>
                                       </g>
                                       <g id="se09tid" class="stem">
                                          <rect x="7334" y="2100" height="542" width="18"/>
                                       </g>
                                       <g id="a9ybxsz" class="accid">
                                          <use xlink:href="#E261-ach4j0" x="6968" y="2670" height="720px" width="720px"/>
                                       </g>
                                    </g>
                                    <g id="nzleopw" class="note" fill="#000000">
                                       <g class="notehead">
                                          <use xlink:href="#E0A4-ach4j0" x="8026" y="2760" height="720px" width="720px"/>
                                       </g>
                                       <g id="sbb0re1" class="stem">
                                          <rect x="8234" y="2160" height="572" width="18"/>
                                          <g id="foo1b3a" class="flag">
                                             <use xlink:href="#E240-ach4j0" x="8234" y="2160" height="720px" width="720px"/>
                                          </g>
                                       </g>
                                       <g id="atojznf" class="accid"/>
                                    </g>
                                 </g>
                                 <g id="la7oq3i" class="layer">
                                    <g id="n1kaptdt" class="note" fill="#000000">
                                       <g class="notehead">
                                          <use xlink:href="#E0A4-ach4j0" x="6472" y="3030" height="720px" width="720px"/>
                                       </g>
                                       <g id="s1q7a7y1" class="stem">
                                          <rect x="6472" y="3058" height="482" width="18"/>
                                       </g>
                                       <g id="alnh58k" class="accid">
                                          <use xlink:href="#E262-ach4j0" x="6286" y="3030" height="720px" width="720px"/>
                                       </g>
                                    </g>
                                    <g id="n1p9jgku" class="note" fill="#000000">
                                       <g class="notehead">
                                          <use xlink:href="#E0A4-ach4j0" x="7576" y="2940" height="720px" width="720px"/>
                                       </g>
                                       <g id="s1dd5pvo" class="stem">
                                          <rect x="7576" y="2968" height="512" width="18"/>
                                       </g>
                                    </g>
                                 </g>
                              </g>
                              <g id="bij9791" class="barLine">
                                 <path d="M8536 540 L8536 1260" stroke="currentColor" stroke-width="27"/>
                                 <path d="M8536 2400 L8536 3120" stroke="currentColor" stroke-width="27"/>
                                 <path d="M8536 1260 L8536 2400" stroke="currentColor" stroke-width="27"/>
                              </g>
                           </g>
                           <g id="m1xyswp6" class="measure">
                              <g id="suovefj" class="staff">
                                 <path d="M8549 540 L11106 540" stroke="currentColor" stroke-width="13"/>
                                 <path d="M8549 720 L11106 720" stroke="currentColor" stroke-width="13"/>
                                 <path d="M8549 900 L11106 900" stroke="currentColor" stroke-width="13"/>
                                 <path d="M8549 1080 L11106 1080" stroke="currentColor" stroke-width="13"/>
                                 <path d="M8549 1260 L11106 1260" stroke="currentColor" stroke-width="13"/>
                                 <g class="ledgerLines below">
                                    <path d="M9635 1440 L9957 1440" stroke="currentColor" stroke-width="22"/>
                                    <path d="M10535 1440 L10857 1440" stroke="currentColor" stroke-width="22"/>
                                 </g>
                                 <g id="l1561hyu" class="layer">
                                    <g id="n1329ed5" class="note" fill="#000000">
                                       <g class="notehead">
                                          <use xlink:href="#E0A4-ach4j0" x="9029" y="1170" height="720px" width="720px"/>
                                       </g>
                                       <g id="svorwp2" class="stem">
                                          <rect x="9237" y="540" height="602" width="18"/>
                                       </g>
                                       <g id="agszw0x" class="accid">
                                          <use xlink:href="#E261-ach4j0" x="8871" y="1170" height="720px" width="720px"/>
                                       </g>
                                    </g>
                                    <g id="nt4om57" class="note" fill="#000000">
                                       <g class="notehead">
                                          <use xlink:href="#E0A4-ach4j0" x="10133" y="1260" height="720px" width="720px"/>
                                       </g>
                                       <g id="seto5zi" class="stem">
                                          <rect x="10341" y="630" height="602" width="18"/>
                                       </g>
                                    </g>
                                 </g>
                                 <g id="l5mxhzj" class="layer">
                                    <g id="nbntkd4" class="note" fill="#000000">
                                       <g class="notehead">
                                          <use xlink:href="#E0A4-ach4j0" x="9029" y="1350" height="720px" width="720px"/>
                                       </g>
                                       <g id="s1n04ese" class="stem">
                                          <rect x="9029" y="1378" height="512" width="18"/>
                                          <g id="f11cd8tw" class="flag">
                                             <use xlink:href="#E241-ach4j0" x="9029" y="1890" height="720px" width="720px"/>
                                          </g>
                                       </g>
                                       <g id="a1r7etd8" class="accid">
                                          <use xlink:href="#E261-ach4j0" x="8729" y="1350" height="720px" width="720px"/>
                                       </g>
                                    </g>
                                    <g id="n1vy59rq" class="note" fill="#000000">
                                       <g class="notehead">
                                          <use xlink:href="#E0A4-ach4j0" x="9683" y="1530" height="720px" width="720px"/>
                                       </g>
                                       <g id="sn3zqu4" class="stem">
                                          <rect x="9683" y="1558" height="422" width="18"/>
                                       </g>
                                    </g>
                                    <g id="n34c1de" class="note" fill="#000000">
                                       <g class="notehead">
                                          <use xlink:href="#E0A4-ach4j0" x="10583" y="1440" height="720px" width="720px"/>
                                       </g>
                                       <g id="s15gft0p" class="stem">
                                          <rect x="10583" y="1468" height="512" width="18"/>
                                          <g id="fxa6x5u" class="flag">
                                             <use xlink:href="#E241-ach4j0" x="10583" y="1980" height="720px" width="720px"/>
                                          </g>
                                       </g>
                                       <g id="a1wigdyu" class="accid"/>
                                    </g>
                                 </g>
                              </g>
                              <g id="s1acwuvw" class="staff">
                                 <path d="M8549 2400 L11106 2400" stroke="currentColor" stroke-width="13"/>
                                 <path d="M8549 2580 L11106 2580" stroke="currentColor" stroke-width="13"/>
                                 <path d="M8549 2760 L11106 2760" stroke="currentColor" stroke-width="13"/>
                                 <path d="M8549 2940 L11106 2940" stroke="currentColor" stroke-width="13"/>
                                 <path d="M8549 3120 L11106 3120" stroke="currentColor" stroke-width="13"/>
                                 <g id="l9rne3c" class="layer">
                                    <g id="nu69obi" class="note" fill="#000000">
                                       <g class="notehead">
                                          <use xlink:href="#E0A4-ach4j0" x="9029" y="2940" height="720px" width="720px"/>
                                       </g>
                                       <g id="swfv6zp" class="stem">
                                          <rect x="9237" y="2310" height="602" width="18"/>
                                          <g id="fok2zuf" class="flag">
                                             <use xlink:href="#E240-ach4j0" x="9237" y="2310" height="720px" width="720px"/>
                                          </g>
                                       </g>
                                    </g>
                                    <g id="ncvry5w" class="note" fill="#000000">
                                       <g class="notehead">
                                          <use xlink:href="#E0A4-ach4j0" x="9683" y="2760" height="720px" width="720px"/>
                                       </g>
                                       <g id="ss96h4m" class="stem">
                                          <rect x="9891" y="2160" height="572" width="18"/>
                                       </g>
                                       <g id="anzo0wo" class="accid">
                                          <use xlink:href="#E261-ach4j0" x="9525" y="2760" height="720px" width="720px"/>
                                       </g>
                                    </g>
                                    <g id="n19gadoj" class="note" fill="#000000">
                                       <g class="notehead">
                                          <use xlink:href="#E0A4-ach4j0" x="10583" y="2850" height="720px" width="720px"/>
                                       </g>
                                       <g id="s10vgy5j" class="stem">
                                          <rect x="10791" y="2220" height="602" width="18"/>
                                          <g id="f1l1vxi7" class="flag">
                                             <use xlink:href="#E240-ach4j0" x="10791" y="2220" height="720px" width="720px"/>
                                          </g>
                                       </g>
                                       <g id="a3mlxkw" class="accid"/>
                                    </g>
                                 </g>
                                 <g id="lpzkb7r" class="layer">
                                    <g id="n3hc88c" class="note" fill="#000000">
                                       <g class="notehead">
                                          <use xlink:href="#E0A4-ach4j0" x="9029" y="3120" height="720px" width="720px"/>
                                       </g>
                                       <g id="snkbqs6" class="stem">
                                          <rect x="9029" y="3148" height="452" width="18"/>
                                       </g>
                                       <g id="at2jhw3" class="accid">
                                          <use xlink:href="#E262-ach4j0" x="8843" y="3120" height="720px" width="720px"/>
                                       </g>
                                    </g>
                                    <g id="nfd91us" class="note" fill="#000000">
                                       <g class="notehead">
                                          <use xlink:href="#E0A4-ach4j0" x="10133" y="3030" height="720px" width="720px"/>
                                       </g>
                                       <g id="sf5ui7t" class="stem">
                                          <rect x="10133" y="3058" height="482" width="18"/>
                                       </g>
                                    </g>
                                 </g>
                              </g>
                              <g id="sjz9fl4" class="slur" color="#000000" fill="#000000">
                                 <path d="M10426,877 C10647,671 11216,724 11397,965 C11187,782 10665,733 10426,877" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="9"/>
                              </g>
                              <g id="bwpzasl" class="barLine">
                                 <path d="M11093 540 L11093 1260" stroke="currentColor" stroke-width="27"/>
                                 <path d="M11093 2400 L11093 3120" stroke="currentColor" stroke-width="27"/>
                                 <path d="M11093 1260 L11093 2400" stroke="currentColor" stroke-width="27"/>
                              </g>
                           </g>
                           <g id="mmtyneo" class="measure">
                              <g id="slirgik" class="staff">
                                 <path d="M11106 540 L13304 540" stroke="currentColor" stroke-width="13"/>
                                 <path d="M11106 720 L13304 720" stroke="currentColor" stroke-width="13"/>
                                 <path d="M11106 900 L13304 900" stroke="currentColor" stroke-width="13"/>
                                 <path d="M11106 1080 L13304 1080" stroke="currentColor" stroke-width="13"/>
                                 <path d="M11106 1260 L13304 1260" stroke="currentColor" stroke-width="13"/>
                                 <g class="ledgerLines below">
                                    <path d="M11238 1440 L11560 1440" stroke="currentColor" stroke-width="22"/>
                                    <path d="M12184 1440 L12506 1440" stroke="currentColor" stroke-width="22"/>
                                    <path d="M12634 1440 L12956 1440" stroke="currentColor" stroke-width="22"/>
                                    <path d="M12184 1620 L12506 1620" stroke="currentColor" stroke-width="22"/>
                                 </g>
                                 <g id="l1q1gpxb" class="layer">
                                    <g id="n14f6mny" class="note" fill="#000000">
                                       <g class="notehead">
                                          <use xlink:href="#E0A4-ach4j0" x="11286" y="1350" height="720px" width="720px"/>
                                       </g>
                                       <g id="sqxcv50" class="stem">
                                          <rect x="11494" y="720" height="602" width="18"/>
                                          <g id="f1x9d775" class="flag">
                                             <use xlink:href="#E240-ach4j0" x="11494" y="720" height="720px" width="720px"/>
                                          </g>
                                       </g>
                                       <g id="aktnm14" class="accid"/>
                                    </g>
                                    <g id="n18v8y0" class="note" fill="#000000">
                                       <g class="notehead">
                                          <use xlink:href="#E0A4-ach4j0" x="11782" y="1080" height="720px" width="720px"/>
                                       </g>
                                       <g id="srwher6" class="stem">
                                          <rect x="11990" y="450" height="602" width="18"/>
                                       </g>
                                       <g id="a15iyb2c" class="accid"/>
                                    </g>
                                    <g id="nu0v6v" class="note" fill="#000000">
                                       <g class="notehead">
                                          <use xlink:href="#E0A4-ach4j0" x="12682" y="1170" height="720px" width="720px"/>
                                       </g>
                                       <g id="s8v3unz" class="stem">
                                          <rect x="12890" y="540" height="602" width="18"/>
                                          <g id="f1l485hu" class="flag">
                                             <use xlink:href="#E240-ach4j0" x="12890" y="540" height="720px" width="720px"/>
                                          </g>
                                       </g>
                                       <g id="a171rdmx" class="accid"/>
                                    </g>
                                 </g>
                                 <g id="l1knxtf0" class="layer">
                                    <g id="naputvs" class="note" fill="#000000">
                                       <g class="notehead">
                                          <use xlink:href="#E0A4-ach4j0" x="11286" y="1530" height="720px" width="720px"/>
                                       </g>
                                       <g id="smsi01r" class="stem">
                                          <rect x="11286" y="1558" height="422" width="18"/>
                                       </g>
                                    </g>
                                    <g id="b1rm5f4n" class="beam">
                                       <polygon points="12232,2115 12700,2070 12700,1980 12232,2025"/>
                                       <g id="nlrzmlg" class="note" fill="#000000">
                                          <g class="notehead">
                                             <use xlink:href="#E0A4-ach4j0" x="12232" y="1620" height="720px" width="720px"/>
                                          </g>
                                          <g id="s6xyxzy" class="stem">
                                             <rect x="12232" y="1648" height="449" width="18"/>
                                          </g>
                                          <g id="a1vhsl12" class="accid">
                                             <use xlink:href="#E262-ach4j0" x="12020" y="1620" height="720px" width="720px"/>
                                          </g>
                                       </g>
                                       <g id="n1k6ka6c" class="note" fill="#000000">
                                          <g class="notehead">
                                             <use xlink:href="#E0A4-ach4j0" x="12682" y="1530" height="720px" width="720px"/>
                                          </g>
                                          <g id="soso18l" class="stem">
                                             <rect x="12682" y="1558" height="494" width="18"/>
                                          </g>
                                       </g>
                                    </g>
                                 </g>
                              </g>
                              <g id="s1fthxiu" class="staff">
                                 <path d="M11106 2400 L13304 2400" stroke="currentColor" stroke-width="13"/>
                                 <path d="M11106 2580 L13304 2580" stroke="currentColor" stroke-width="13"/>
                                 <path d="M11106 2760 L13304 2760" stroke="currentColor" stroke-width="13"/>
                                 <path d="M11106 2940 L13304 2940" stroke="currentColor" stroke-width="13"/>
                                 <path d="M11106 3120 L13304 3120" stroke="currentColor" stroke-width="13"/>
                                 <g id="l15lx2k4" class="layer">
                                    <g id="nnp8w2n" class="note" fill="#000000">
                                       <g class="notehead">
                                          <use xlink:href="#E0A4-ach4j0" x="11286" y="2580" height="720px" width="720px"/>
                                       </g>
                                       <g id="s162f16e" class="stem">
                                          <rect x="11494" y="2040" height="512" width="18"/>
                                          <g id="f1ygty7e" class="flag">
                                             <use xlink:href="#E240-ach4j0" x="11494" y="2040" height="720px" width="720px"/>
                                          </g>
                                       </g>
                                       <g id="a1g20ajx" class="accid"/>
                                    </g>
                                    <g id="n12afhq8" class="note" fill="#000000">
                                       <g class="notehead">
                                          <use xlink:href="#E0A4-ach4j0" x="11782" y="2670" height="720px" width="720px"/>
                                       </g>
                                       <g id="s1jr9dk0" class="stem">
                                          <rect x="11990" y="2100" height="542" width="18"/>
                                       </g>
                                    </g>
                                    <g id="n1skfdxx" class="note" fill="#000000">
                                       <g class="notehead">
                                          <use xlink:href="#E0A4-ach4j0" x="12682" y="2760" height="720px" width="720px"/>
                                       </g>
                                       <g id="s1g7jdz1" class="stem">
                                          <rect x="12890" y="2160" height="572" width="18"/>
                                          <g id="f4y5jaa" class="flag">
                                             <use xlink:href="#E240-ach4j0" x="12890" y="2160" height="720px" width="720px"/>
                                          </g>
                                       </g>
                                       <g id="adkoz4y" class="accid"/>
                                    </g>
                                 </g>
                                 <g id="l1cb89mk" class="layer">
                                    <g id="nvtrg4o" class="note" fill="#000000">
                                       <g class="notehead">
                                          <use xlink:href="#E0A3-ach4j0" x="11286" y="2940" height="720px" width="720px"/>
                                       </g>
                                       <g id="s1szxj05" class="stem">
                                          <rect x="11286" y="2965" height="515" width="18"/>
                                       </g>
                                    </g>
                                 </g>
                              </g>
                              <g id="bw7ssu9" class="barLine">
                                 <path d="M13192 540 L13192 1260" stroke="currentColor" stroke-width="27"/>
                                 <path d="M13291 540 L13291 1260" stroke="currentColor" stroke-width="27"/>
                                 <path d="M13192 2400 L13192 3120" stroke="currentColor" stroke-width="27"/>
                                 <path d="M13291 2400 L13291 3120" stroke="currentColor" stroke-width="27"/>
                                 <path d="M13192 1260 L13192 2400" stroke="currentColor" stroke-width="27"/>
                                 <path d="M13291 1260 L13291 2400" stroke="currentColor" stroke-width="27"/>
                              </g>
                           </g>
                           <g id="s1dvdrep" class="systemMilestoneEnd s1rxu42b"/>
                        </g>
                        <g id="pheqfs2" class="pageMilestoneEnd s14toj8d"/>
                        <g id="p1eea8l9" class="pageMilestoneEnd m13kbkho"/>
                        <g id="p14hyo2i" class="pgHead autogenerated"/>
                     </g>
                  </svg>
               </svg>-->

              </div>
              <h1>Diplomatic Transcript</h1>
              <div class="diplomatic transcript">
                 <svg width="2313.6px" height="1800px" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:mei="http://www.music-encoding.org/ns/mei" overflow="visible">
                  <desc>Engraved by Verovio 3.11.0-e2d6db8</desc>
                  <defs>
                     <symbol id="E0A3-1f5wks1" viewBox="0 0 1000 1000" overflow="inherit">
                        <path transform="scale(1,-1)" d="M278 64c0 22 -17 39 -43 39c-12 0 -26 -3 -41 -10c-85 -43 -165 -94 -165 -156c5 -25 15 -32 49 -32c67 11 200 95 200 159zM0 -36c0 68 73 174 200 174c66 0 114 -39 114 -97c0 -84 -106 -173 -218 -173c-64 0 -96 32 -96 96z"></path>
                     </symbol>
                     <symbol id="E0A4-1f5wks1" viewBox="0 0 1000 1000" overflow="inherit">
                        <path transform="scale(1,-1)" d="M0 -39c0 68 73 172 200 172c66 0 114 -37 114 -95c0 -84 -106 -171 -218 -171c-64 0 -96 30 -96 94z"></path>
                     </symbol>
                     <symbol id="E240-1f5wks1" viewBox="0 0 1000 1000" overflow="inherit">
                        <path transform="scale(1,-1)" d="M179 -646c15 29 29 55 46 102c18 49 30 108 30 138c0 105 -80 173 -168 200c-18 5 -47 9 -87 16v190h22c8 0 33 -61 71 -95c4 -3 -2 3 61 -56c62 -58 122 -137 122 -241c0 -38 -13 -106 -35 -163c-20 -51 -43 -99 -66 -132c-6 -5 -10 -7 -13 -7s-5 2 -5 5l4 10 c1 3 14 25 18 33z"></path>
                     </symbol>
                     <symbol id="E241-1f5wks1" viewBox="0 0 1000 1000" overflow="inherit">
                        <path transform="scale(1,-1)" d="M179 646c-4 8 -17 30 -18 33l-4 10c0 3 2 5 5 5s7 -2 13 -7c23 -33 46 -81 66 -132c22 -57 35 -125 35 -163c0 -104 -60 -183 -122 -241c-63 -59 -57 -53 -61 -56c-38 -34 -63 -95 -71 -95h-22v190c40 7 69 11 87 16c88 27 168 95 168 200c0 30 -12 89 -30 138 c-17 47 -31 73 -46 102z"></path>
                     </symbol>
                     <symbol id="E261-1f5wks1" viewBox="0 0 1000 1000" overflow="inherit">
                        <path transform="scale(1,-1)" d="M0 -188v539h18v-191l139 22v-533h-17v186zM18 -100l122 17v176l-122 -19v-174z"></path>
                     </symbol>
                     <symbol id="E262-1f5wks1" viewBox="0 0 1000 1000" overflow="inherit">
                        <path transform="scale(1,-1)" d="M136 186v169h17v-164l44 14v-91l-44 -14v-165l44 12v-91l-44 -13v-155h-17v150l-76 -22v-155h-17v149l-43 -13v90l43 14v167l-43 -14v92l43 13v169h17v-163zM60 73v-167l76 22v168z"></path>
                     </symbol>
                  </defs>
                  <svg class="definition-scale" color="black" viewBox="0 0 77120 60000">
                     <g class="page-margin" transform="translate(0, 0)">
                        <g id="m8dbe91d5-3539-4230-8060-4b325f990ccd" class="mdiv">
                           <g id="bbox-m8dbe91d5-3539-4230-8060-4b325f990ccd" class="mdiv bounding-box"></g>
                        </g>
                        <g id="s1fdpk4z" class="score pageMilestone">
                           <g id="bbox-s1fdpk4z" class="score bounding-box"></g>
                        </g>
                        <g id="s1o0qc91" class="system">
                           <g id="bbox-s1o0qc91" class="system bounding-box">
                              <rect x="-1" y="2764" height="1411" width="51" fill="transparent"></rect>
                           </g>
                           <path d="M25 2790 L25 4150" stroke="currentColor" stroke-width="51"></path>
                           <g id="g1t7su3y" class="grpSym">
                              <g id="bbox-g1t7su3y" class="grpSym bounding-box"></g>
                           </g>
                           <g id="m1wcmsud" class="measure">
                              <g id="bbox-m1wcmsud" class="measure bounding-box"></g>
                              <g id="s1oagyjc" class="staff">
                                 <g id="bbox-s1oagyjc" class="staff bounding-box">
                                    <rect x="7687" y="2777" height="1385" width="30325" fill="transparent"></rect>
                                 </g>
                                 <path d="M7700 2790 L38000 2790" stroke="currentColor" stroke-width="25"></path>
                                 <path d="M7700 3130 L38000 3130" stroke="currentColor" stroke-width="25"></path>
                                 <path d="M7700 3470 L38000 3470" stroke="currentColor" stroke-width="25"></path>
                                 <path d="M7700 3810 L38000 3810" stroke="currentColor" stroke-width="25"></path>
                                 <path d="M7700 4150 L38000 4150" stroke="currentColor" stroke-width="25"></path>
                                 <g class="ledgerLines below">
                                    <path d="M19849 4490 L20457 4490" stroke="currentColor" stroke-width="42"></path>
                                    <path d="M27959 4490 L28567 4490" stroke="currentColor" stroke-width="42"></path>
                                    <path d="M28989 4490 L29597 4490" stroke="currentColor" stroke-width="42"></path>
                                    <path d="M33729 4490 L34337 4490" stroke="currentColor" stroke-width="42"></path>
                                    <path d="M35149 4490 L35757 4490" stroke="currentColor" stroke-width="42"></path>
                                    <path d="M35989 4490 L36597 4490" stroke="currentColor" stroke-width="42"></path>
                                    <path d="M35149 4830 L35757 4830" stroke="currentColor" stroke-width="42"></path>
                                 </g>
                                 <g id="lw3nbd7" class="layer">
                                    <g id="bbox-lw3nbd7" class="layer bounding-box"></g>
                                    <g id="n49a0eeac-3c05-4c62-b516-8b3868c3fdfc" class="note">
                                       <g id="bbox-n49a0eeac-3c05-4c62-b516-8b3868c3fdfc" class="note bounding-box">
                                          <rect x="13130" y="3459" height="361" width="427" fill="transparent"></rect>
                                       </g>
                                       <g class="notehead">
                                          <use href="#E0A4-1f5wks1" x="13130" y="3640" height="1360px" width="1360px"></use>
                                       </g>
                                       <g id="swoz24y" class="stem">
                                          <g id="bbox-swoz24y" class="stem bounding-box">
                                             <rect x="13523" y="2464" height="1124" width="34" fill="transparent"></rect>
                                          </g>
                                          <rect x="13523" y="2464" height="1124" width="34"></rect>
                                       </g>
                                    </g>
                                    <g id="n58d26888-5723-4b17-968f-0c6c291d2995" class="note">
                                       <g id="bbox-n58d26888-5723-4b17-968f-0c6c291d2995" class="note bounding-box">
                                          <rect x="14380" y="3629" height="361" width="427" fill="transparent"></rect>
                                       </g>
                                       <g class="notehead">
                                          <use href="#E0A4-1f5wks1" x="14380" y="3810" height="1360px" width="1360px"></use>
                                       </g>
                                       <g id="s1olaruf" class="stem">
                                          <g id="bbox-s1olaruf" class="stem bounding-box">
                                             <rect x="14773" y="2634" height="1124" width="34" fill="transparent"></rect>
                                          </g>
                                          <rect x="14773" y="2634" height="1124" width="34"></rect>
                                       </g>
                                    </g>
                                    <g id="n6016bf20-c5e0-4c96-bd3e-813c7f3cd21d" class="note">
                                       <g id="bbox-n6016bf20-c5e0-4c96-bd3e-813c7f3cd21d" class="note bounding-box">
                                          <rect x="12730" y="3969" height="361" width="427" fill="transparent"></rect>
                                       </g>
                                       <g class="notehead">
                                          <use href="#E0A4-1f5wks1" x="12730" y="4150" height="1360px" width="1360px"></use>
                                       </g>
                                       <g id="s1h3cbj6" class="stem">
                                          <g id="bbox-s1h3cbj6" class="stem bounding-box">
                                             <rect x="12730" y="4202" height="956" width="34" fill="transparent"></rect>
                                          </g>
                                          <rect x="12730" y="4202" height="956" width="34"></rect>
                                          <g id="f5wc0jj" class="flag">
                                             <g id="bbox-f5wc0jj" class="flag bounding-box">
                                                <rect x="12730" y="4215" height="943" width="375" fill="transparent"></rect>
                                             </g>
                                             <use href="#E241-1f5wks1" x="12730" y="5158" height="1360px" width="1360px"></use>
                                          </g>
                                       </g>
                                    </g>
                                    <g id="nf7668e01-e26d-4a0c-b353-13a90a0e84a6" class="note">
                                       <g id="bbox-nf7668e01-e26d-4a0c-b353-13a90a0e84a6" class="note bounding-box">
                                          <rect x="13520" y="4139" height="361" width="427" fill="transparent"></rect>
                                       </g>
                                       <g class="notehead">
                                          <use href="#E0A4-1f5wks1" x="13520" y="4320" height="1360px" width="1360px"></use>
                                       </g>
                                       <g id="s1aujhci" class="stem">
                                          <g id="bbox-s1aujhci" class="stem bounding-box">
                                             <rect x="13520" y="4372" height="788" width="34" fill="transparent"></rect>
                                          </g>
                                          <rect x="13520" y="4372" height="788" width="34"></rect>
                                       </g>
                                    </g>
                                    <g id="n7cf2b812-d621-42af-b9c0-a74b1433bc92" class="note">
                                       <g id="bbox-n7cf2b812-d621-42af-b9c0-a74b1433bc92" class="note bounding-box">
                                          <rect x="15010" y="4139" height="361" width="427" fill="transparent"></rect>
                                       </g>
                                       <g class="notehead">
                                          <use href="#E0A4-1f5wks1" x="15010" y="4320" height="1360px" width="1360px"></use>
                                       </g>
                                       <g id="s1eg2hxd" class="stem">
                                          <g id="bbox-s1eg2hxd" class="stem bounding-box">
                                             <rect x="15010" y="4372" height="956" width="34" fill="transparent"></rect>
                                          </g>
                                          <rect x="15010" y="4372" height="956" width="34"></rect>
                                          <g id="fw602lw" class="flag">
                                             <g id="bbox-fw602lw" class="flag bounding-box">
                                                <rect x="15010" y="4385" height="943" width="375" fill="transparent"></rect>
                                             </g>
                                             <use href="#E241-1f5wks1" x="15010" y="5328" height="1360px" width="1360px"></use>
                                          </g>
                                       </g>
                                    </g>
                                    <g id="nc58fa8a1-8701-47fa-90b7-125ccc20b4b9" class="note">
                                       <g id="bbox-nc58fa8a1-8701-47fa-90b7-125ccc20b4b9" class="note bounding-box">
                                          <rect x="19660" y="3629" height="361" width="427" fill="transparent"></rect>
                                       </g>
                                       <g class="notehead">
                                          <use href="#E0A4-1f5wks1" x="19660" y="3810" height="1360px" width="1360px"></use>
                                       </g>
                                       <g id="sqp5gv9" class="stem">
                                          <g id="bbox-sqp5gv9" class="stem bounding-box">
                                             <rect x="20053" y="2634" height="1124" width="34" fill="transparent"></rect>
                                          </g>
                                          <rect x="20053" y="2634" height="1124" width="34"></rect>
                                       </g>
                                    </g>
                                    <g id="nba009671-0a13-4596-bb0f-74a21f6fe1b0" class="note">
                                       <g id="bbox-nba009671-0a13-4596-bb0f-74a21f6fe1b0" class="note bounding-box">
                                          <rect x="20790" y="3799" height="361" width="427" fill="transparent"></rect>
                                       </g>
                                       <g class="notehead">
                                          <use href="#E0A4-1f5wks1" x="20790" y="3980" height="1360px" width="1360px"></use>
                                       </g>
                                       <g id="s1ae04ub" class="stem">
                                          <g id="bbox-s1ae04ub" class="stem bounding-box">
                                             <rect x="21183" y="2804" height="1124" width="34" fill="transparent"></rect>
                                          </g>
                                          <rect x="21183" y="2804" height="1124" width="34"></rect>
                                       </g>
                                    </g>
                                    <g id="ne33b6bee-2c1a-4bef-8530-bf85b0a57a2b" class="note">
                                       <g id="bbox-ne33b6bee-2c1a-4bef-8530-bf85b0a57a2b" class="note bounding-box">
                                          <rect x="18480" y="3969" height="361" width="427" fill="transparent"></rect>
                                       </g>
                                       <g class="notehead">
                                          <use href="#E0A4-1f5wks1" x="18480" y="4150" height="1360px" width="1360px"></use>
                                       </g>
                                       <g id="sdabhsq" class="stem">
                                          <g id="bbox-sdabhsq" class="stem bounding-box">
                                             <rect x="18480" y="4202" height="956" width="34" fill="transparent"></rect>
                                          </g>
                                          <rect x="18480" y="4202" height="956" width="34"></rect>
                                          <g id="f9dww2r" class="flag">
                                             <g id="bbox-f9dww2r" class="flag bounding-box">
                                                <rect x="18480" y="4215" height="943" width="375" fill="transparent"></rect>
                                             </g>
                                             <use href="#E241-1f5wks1" x="18480" y="5158" height="1360px" width="1360px"></use>
                                          </g>
                                       </g>
                                    </g>
                                    <g id="nbced82da-72a5-4d1b-8f6c-4e3e8c30cf8c" class="note">
                                       <g id="bbox-nbced82da-72a5-4d1b-8f6c-4e3e8c30cf8c" class="note bounding-box">
                                          <rect x="19940" y="4309" height="361" width="427" fill="transparent"></rect>
                                       </g>
                                       <g class="notehead">
                                          <use href="#E0A4-1f5wks1" x="19940" y="4490" height="1360px" width="1360px"></use>
                                       </g>
                                       <g id="s1kmsi4m" class="stem">
                                          <g id="bbox-s1kmsi4m" class="stem bounding-box">
                                             <rect x="19940" y="4542" height="788" width="34" fill="transparent"></rect>
                                          </g>
                                          <rect x="19940" y="4542" height="788" width="34"></rect>
                                       </g>
                                    </g>
                                    <g id="nfa3a9b74-1785-41ab-baff-8a5472c38acc" class="note">
                                       <g id="bbox-nfa3a9b74-1785-41ab-baff-8a5472c38acc" class="note bounding-box">
                                          <rect x="21530" y="4139" height="361" width="427" fill="transparent"></rect>
                                       </g>
                                       <g class="notehead">
                                          <use href="#E0A4-1f5wks1" x="21530" y="4320" height="1360px" width="1360px"></use>
                                       </g>
                                       <g id="s16dhxeq" class="stem">
                                          <g id="bbox-s16dhxeq" class="stem bounding-box">
                                             <rect x="21530" y="4372" height="956" width="34" fill="transparent"></rect>
                                          </g>
                                          <rect x="21530" y="4372" height="956" width="34"></rect>
                                          <g id="f1wb23a5" class="flag">
                                             <g id="bbox-f1wb23a5" class="flag bounding-box">
                                                <rect x="21530" y="4385" height="943" width="375" fill="transparent"></rect>
                                             </g>
                                             <use href="#E241-1f5wks1" x="21530" y="5328" height="1360px" width="1360px"></use>
                                          </g>
                                       </g>
                                    </g>
                                    <g id="n849a886a-6dbb-4d8e-90a4-4cb5ab1629f6" class="note">
                                       <g id="bbox-n849a886a-6dbb-4d8e-90a4-4cb5ab1629f6" class="note bounding-box">
                                          <rect x="25670" y="3799" height="361" width="427" fill="transparent"></rect>
                                       </g>
                                       <g class="notehead">
                                          <use href="#E0A4-1f5wks1" x="25670" y="3980" height="1360px" width="1360px"></use>
                                       </g>
                                       <g id="sgpdm3q" class="stem">
                                          <g id="bbox-sgpdm3q" class="stem bounding-box">
                                             <rect x="26063" y="2804" height="1124" width="34" fill="transparent"></rect>
                                          </g>
                                          <rect x="26063" y="2804" height="1124" width="34"></rect>
                                       </g>
                                    </g>
                                    <g id="n6c50b08e-2e24-467f-a328-d628ad8828e8" class="note">
                                       <g id="bbox-n6c50b08e-2e24-467f-a328-d628ad8828e8" class="note bounding-box">
                                          <rect x="26610" y="4139" height="361" width="427" fill="transparent"></rect>
                                       </g>
                                       <g class="notehead">
                                          <use href="#E0A4-1f5wks1" x="26610" y="4320" height="1360px" width="1360px"></use>
                                       </g>
                                       <g id="s1v0jykx" class="stem">
                                          <g id="bbox-s1v0jykx" class="stem bounding-box">
                                             <rect x="26610" y="4372" height="956" width="34" fill="transparent"></rect>
                                          </g>
                                          <rect x="26610" y="4372" height="956" width="34"></rect>
                                          <g id="f1bveqty" class="flag">
                                             <g id="bbox-f1bveqty" class="flag bounding-box">
                                                <rect x="26610" y="4385" height="943" width="375" fill="transparent"></rect>
                                             </g>
                                             <use href="#E241-1f5wks1" x="26610" y="5328" height="1360px" width="1360px"></use>
                                          </g>
                                       </g>
                                    </g>
                                    <g id="n86b95c91-6f6d-49c7-9ab4-b352b12606df" class="note">
                                       <g id="bbox-n86b95c91-6f6d-49c7-9ab4-b352b12606df" class="note bounding-box">
                                          <rect x="28050" y="4479" height="361" width="427" fill="transparent"></rect>
                                       </g>
                                       <g class="notehead">
                                          <use href="#E0A4-1f5wks1" x="28050" y="4660" height="1360px" width="1360px"></use>
                                       </g>
                                       <g id="stopoa7" class="stem">
                                          <g id="bbox-stopoa7" class="stem bounding-box">
                                             <rect x="28050" y="4712" height="788" width="34" fill="transparent"></rect>
                                          </g>
                                          <rect x="28050" y="4712" height="788" width="34"></rect>
                                       </g>
                                    </g>
                                    <g id="nb7bdf8de-6772-4acd-86d8-b87d9a1c84d9" class="note">
                                       <g id="bbox-nb7bdf8de-6772-4acd-86d8-b87d9a1c84d9" class="note bounding-box">
                                          <rect x="29170" y="3969" height="361" width="427" fill="transparent"></rect>
                                       </g>
                                       <g class="notehead">
                                          <use href="#E0A4-1f5wks1" x="29170" y="4150" height="1360px" width="1360px"></use>
                                       </g>
                                       <g id="s1tz1kx8" class="stem">
                                          <g id="bbox-s1tz1kx8" class="stem bounding-box">
                                             <rect x="29563" y="2974" height="1124" width="34" fill="transparent"></rect>
                                          </g>
                                          <rect x="29563" y="2974" height="1124" width="34"></rect>
                                       </g>
                                    </g>
                                    <g id="n7f375034-54a8-44e7-870e-1fa8a304d0c5" class="note">
                                       <g id="bbox-n7f375034-54a8-44e7-870e-1fa8a304d0c5" class="note bounding-box">
                                          <rect x="29080" y="4309" height="361" width="427" fill="transparent"></rect>
                                       </g>
                                       <g class="notehead">
                                          <use href="#E0A4-1f5wks1" x="29080" y="4490" height="1360px" width="1360px"></use>
                                       </g>
                                       <g id="sbwms18" class="stem">
                                          <g id="bbox-sbwms18" class="stem bounding-box">
                                             <rect x="29080" y="4542" height="956" width="34" fill="transparent"></rect>
                                          </g>
                                          <rect x="29080" y="4542" height="956" width="34"></rect>
                                          <g id="fzm8rvc" class="flag">
                                             <g id="bbox-fzm8rvc" class="flag bounding-box">
                                                <rect x="29080" y="4555" height="943" width="375" fill="transparent"></rect>
                                             </g>
                                             <use href="#E241-1f5wks1" x="29080" y="5498" height="1360px" width="1360px"></use>
                                          </g>
                                       </g>
                                    </g>
                                    <g id="n81e2006a-ea06-4817-b2a6-0497b012d990" class="note">
                                       <g id="bbox-n81e2006a-ea06-4817-b2a6-0497b012d990" class="note bounding-box">
                                          <rect x="32760" y="4139" height="361" width="427" fill="transparent"></rect>
                                       </g>
                                       <g class="notehead">
                                          <use href="#E0A4-1f5wks1" x="32760" y="4320" height="1360px" width="1360px"></use>
                                       </g>
                                       <g id="snpkult" class="stem">
                                          <g id="bbox-snpkult" class="stem bounding-box">
                                             <rect x="33153" y="3144" height="1124" width="34" fill="transparent"></rect>
                                          </g>
                                          <rect x="33153" y="3144" height="1124" width="34"></rect>
                                          <g id="f1urckt5" class="flag">
                                             <g id="bbox-f1urckt5" class="flag bounding-box">
                                                <rect x="33153" y="3144" height="943" width="375" fill="transparent"></rect>
                                             </g>
                                             <use href="#E240-1f5wks1" x="33153" y="3144" height="1360px" width="1360px"></use>
                                          </g>
                                       </g>
                                    </g>
                                    <g id="n0232d3b1-50ad-4926-9586-edab03a69be4" class="note">
                                       <g id="bbox-n0232d3b1-50ad-4926-9586-edab03a69be4" class="note bounding-box">
                                          <rect x="33820" y="4479" height="361" width="427" fill="transparent"></rect>
                                       </g>
                                       <g class="notehead">
                                          <use href="#E0A4-1f5wks1" x="33820" y="4660" height="1360px" width="1360px"></use>
                                       </g>
                                       <g id="s6oarue" class="stem">
                                          <g id="bbox-s6oarue" class="stem bounding-box">
                                             <rect x="33820" y="4712" height="788" width="34" fill="transparent"></rect>
                                          </g>
                                          <rect x="33820" y="4712" height="788" width="34"></rect>
                                       </g>
                                    </g>
                                    <g id="n3ccfe715-49d6-494e-b119-f6046c0459a3" class="note">
                                       <g id="bbox-n3ccfe715-49d6-494e-b119-f6046c0459a3" class="note bounding-box">
                                          <rect x="34400" y="3629" height="361" width="427" fill="transparent"></rect>
                                       </g>
                                       <g class="notehead">
                                          <use href="#E0A4-1f5wks1" x="34400" y="3810" height="1360px" width="1360px"></use>
                                       </g>
                                       <g id="st3loyu" class="stem">
                                          <g id="bbox-st3loyu" class="stem bounding-box">
                                             <rect x="34793" y="2634" height="1124" width="34" fill="transparent"></rect>
                                          </g>
                                          <rect x="34793" y="2634" height="1124" width="34"></rect>
                                       </g>
                                    </g>
                                    <g id="bbaceac1d-c461-4e01-ad88-c19f3cf9ede5" class="beam">
                                       <g id="bbox-bbaceac1d-c461-4e01-ad88-c19f3cf9ede5" class="beam bounding-box">
                                          <rect x="35240" y="5510" height="255" width="874" fill="transparent"></rect>
                                       </g>
                                       <polygon points="35240,5765 36114,5680 36114,5510 35240,5595 "></polygon>
                                       <g id="n0d7623be-a150-4dde-8e91-37618159315c" class="note">
                                          <g id="bbox-n0d7623be-a150-4dde-8e91-37618159315c" class="note bounding-box">
                                             <rect x="35240" y="4649" height="361" width="427" fill="transparent"></rect>
                                          </g>
                                          <g class="notehead">
                                             <use href="#E0A4-1f5wks1" x="35240" y="4830" height="1360px" width="1360px"></use>
                                          </g>
                                          <g id="sg1ea4x" class="stem">
                                             <g id="bbox-sg1ea4x" class="stem bounding-box">
                                                <rect x="35240" y="4882" height="849" width="34" fill="transparent"></rect>
                                             </g>
                                             <rect x="35240" y="4882" height="849" width="34"></rect>
                                          </g>
                                       </g>
                                       <g id="nfa2f3208-baf4-42d2-a89d-1f0202c32289" class="note">
                                          <g id="bbox-nfa2f3208-baf4-42d2-a89d-1f0202c32289" class="note bounding-box">
                                             <rect x="36080" y="4479" height="361" width="427" fill="transparent"></rect>
                                          </g>
                                          <g class="notehead">
                                             <use href="#E0A4-1f5wks1" x="36080" y="4660" height="1360px" width="1360px"></use>
                                          </g>
                                          <g id="s4n331y" class="stem">
                                             <g id="bbox-s4n331y" class="stem bounding-box">
                                                <rect x="36080" y="4712" height="934" width="34" fill="transparent"></rect>
                                             </g>
                                             <rect x="36080" y="4712" height="934" width="34"></rect>
                                          </g>
                                       </g>
                                    </g>
                                    <g id="nca019831-c533-4825-a3dd-037149ee3078" class="note">
                                       <g id="bbox-nca019831-c533-4825-a3dd-037149ee3078" class="note bounding-box">
                                          <rect x="36100" y="3799" height="361" width="427" fill="transparent"></rect>
                                       </g>
                                       <g class="notehead">
                                          <use href="#E0A4-1f5wks1" x="36100" y="3980" height="1360px" width="1360px"></use>
                                       </g>
                                       <g id="s3ok4bq" class="stem">
                                          <g id="bbox-s3ok4bq" class="stem bounding-box">
                                             <rect x="36493" y="2804" height="1124" width="34" fill="transparent"></rect>
                                          </g>
                                          <rect x="36493" y="2804" height="1124" width="34"></rect>
                                          <g id="fl74u2u" class="flag">
                                             <g id="bbox-fl74u2u" class="flag bounding-box">
                                                <rect x="36493" y="2804" height="943" width="375" fill="transparent"></rect>
                                             </g>
                                             <use href="#E240-1f5wks1" x="36493" y="2804" height="1360px" width="1360px"></use>
                                          </g>
                                       </g>
                                    </g>
                                    <g id="acdcaf2bf-0d20-4fea-8660-1106105b49cc" class="accid">
                                       <g id="bbox-acdcaf2bf-0d20-4fea-8660-1106105b49cc" class="accid bounding-box">
                                          <rect x="9430" y="2308" height="943" width="267" fill="transparent"></rect>
                                       </g>
                                       <use href="#E262-1f5wks1" x="9430" y="2790" height="1360px" width="1360px"></use>
                                    </g>
                                    <g id="a250f34a9-1905-4467-be64-a48f929c811b" class="accid">
                                       <g id="bbox-a250f34a9-1905-4467-be64-a48f929c811b" class="accid bounding-box">
                                          <rect x="10300" y="2818" height="943" width="267" fill="transparent"></rect>
                                       </g>
                                       <use href="#E262-1f5wks1" x="10300" y="3300" height="1360px" width="1360px"></use>
                                    </g>
                                    <g id="a201b4eb0-49dc-4474-8306-4f00391ab2ec" class="accid">
                                       <g id="bbox-a201b4eb0-49dc-4474-8306-4f00391ab2ec" class="accid bounding-box">
                                          <rect x="11380" y="2138" height="943" width="267" fill="transparent"></rect>
                                       </g>
                                       <use href="#E262-1f5wks1" x="11380" y="2620" height="1360px" width="1360px"></use>
                                    </g>
                                    <g id="a601ee5c6-0a2d-4a84-88bb-07c2dd7cb804" class="accid">
                                       <g id="bbox-a601ee5c6-0a2d-4a84-88bb-07c2dd7cb804" class="accid bounding-box">
                                          <rect x="12170" y="2648" height="943" width="267" fill="transparent"></rect>
                                       </g>
                                       <use href="#E262-1f5wks1" x="12170" y="3130" height="1360px" width="1360px"></use>
                                    </g>
                                    <g id="ade56cbc2-ce87-4b61-9b8c-5f46154574a4" class="accid">
                                       <g id="bbox-ade56cbc2-ce87-4b61-9b8c-5f46154574a4" class="accid bounding-box">
                                          <rect x="18930" y="3333" height="954" width="213" fill="transparent"></rect>
                                       </g>
                                       <use href="#E261-1f5wks1" x="18930" y="3810" height="1360px" width="1360px"></use>
                                    </g>
                                    <g id="a8b937d05-4655-4c69-9271-8e7c702af769" class="accid">
                                       <g id="bbox-a8b937d05-4655-4c69-9271-8e7c702af769" class="accid bounding-box">
                                          <rect x="25080" y="3503" height="954" width="213" fill="transparent"></rect>
                                       </g>
                                       <use href="#E261-1f5wks1" x="25080" y="3980" height="1360px" width="1360px"></use>
                                    </g>
                                    <g id="a25479a31-6541-419a-8826-8ab4212863a6" class="accid">
                                       <g id="bbox-a25479a31-6541-419a-8826-8ab4212863a6" class="accid bounding-box">
                                          <rect x="24350" y="3843" height="954" width="213" fill="transparent"></rect>
                                       </g>
                                       <use href="#E261-1f5wks1" x="24350" y="4320" height="1360px" width="1360px"></use>
                                    </g>
                                    <g id="a3d02735c-a03e-4d20-9bd0-920c20c883fe" class="accid">
                                       <g id="bbox-a3d02735c-a03e-4d20-9bd0-920c20c883fe" class="accid bounding-box">
                                          <rect x="34710" y="4348" height="943" width="267" fill="transparent"></rect>
                                       </g>
                                       <use href="#E262-1f5wks1" x="34710" y="4830" height="1360px" width="1360px"></use>
                                    </g>
                                    <g id="a9394cf29-a2ed-4117-9ceb-60267086e82c" class="accid">
                                       <g id="bbox-a9394cf29-a2ed-4117-9ceb-60267086e82c" class="accid bounding-box">
                                          <rect x="26170" y="3843" height="954" width="213" fill="transparent"></rect>
                                       </g>
                                       <use href="#E261-1f5wks1" x="26170" y="4320" height="1360px" width="1360px"></use>
                                    </g>
                                    <g id="b1cdb0e7f-df1e-47b3-8ee5-2ca2f45a3edf" class="barLine">
                                       <g id="bbox-b1cdb0e7f-df1e-47b3-8ee5-2ca2f45a3edf" class="barLine bounding-box">
                                          <rect x="18000" y="2764" height="1411" width="51" fill="transparent"></rect>
                                       </g>
                                       <path d="M18026 2790 L18026 4150" stroke="currentColor" stroke-width="51"></path>
                                    </g>
                                    <g id="b717f7060-b906-4671-be73-6c4a74df72ba" class="barLine">
                                       <g id="bbox-b717f7060-b906-4671-be73-6c4a74df72ba" class="barLine bounding-box">
                                          <rect x="23600" y="2764" height="1411" width="51" fill="transparent"></rect>
                                       </g>
                                       <path d="M23626 2790 L23626 4150" stroke="currentColor" stroke-width="51"></path>
                                    </g>
                                    <g id="ba680c6fb-aa3a-45b5-aef0-33982acb217f" class="barLine">
                                       <g id="bbox-ba680c6fb-aa3a-45b5-aef0-33982acb217f" class="barLine bounding-box">
                                          <rect x="31300" y="2764" height="1411" width="51" fill="transparent"></rect>
                                       </g>
                                       <path d="M31326 2790 L31326 4150" stroke="currentColor" stroke-width="51"></path>
                                    </g>
                                    <g id="bac4e8ee9-ffcc-40bb-80a9-9892f7a51f27" class="barLine">
                                       <g id="bbox-bac4e8ee9-ffcc-40bb-80a9-9892f7a51f27" class="barLine bounding-box">
                                          <rect x="37800" y="2764" height="1411" width="238" fill="transparent"></rect>
                                       </g>
                                       <path d="M37826 2790 L37826 4150" stroke="currentColor" stroke-width="51"></path>
                                       <path d="M38013 2790 L38013 4150" stroke="currentColor" stroke-width="51"></path>
                                    </g>
                                 </g>
                              </g>
                              <g id="td6a061ec-5353-4565-8bcc-d819ff673fbe" class="tie">
                                 <path d="M15521,4235 C16231,3945 17682,3945 18395,4235 C17667,4035 16246,4035 15521,4235" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="17"></path>
                                 <g id="bbox-td6a061ec-5353-4565-8bcc-d819ff673fbe" class="tie bounding-box">
                                    <rect x="15521" y="4017" height="218" width="2874" fill="transparent"></rect>
                                 </g>
                              </g>
                              <g id="s0b241d04-0cee-495b-b5b4-90e9e5ff6db0" class="tie">
                                 <path d="M29681,4235 C30436,4437 31917,4437 32675,4235 C31932,4527 30421,4527 29681,4235" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="17"></path>
                                 <g id="bbox-s0b241d04-0cee-495b-b5b4-90e9e5ff6db0" class="tie bounding-box">
                                    <rect x="29681" y="4235" height="219" width="2994" fill="transparent"></rect>
                                 </g>
                              </g>
                              <g id="b17fi5u2" class="barLine">
                                 <g id="bbox-b17fi5u2" class="barLine bounding-box">
                                    <rect x="7686" y="2776" height="1387" width="27" fill="transparent"></rect>
                                 </g>
                                 <path d="M7700 2790 L7700 4150" stroke="currentColor" stroke-width="27"></path>
                              </g>
                           </g>
                        </g>
                        <g id="s202p1f" class="system">
                           <g id="bbox-s202p1f" class="system bounding-box">
                              <rect x="-1" y="5914" height="1411" width="51" fill="transparent"></rect>
                           </g>
                           <path d="M25 5940 L25 7300" stroke="currentColor" stroke-width="51"></path>
                           <g id="gtvqbht" class="grpSym">
                              <g id="bbox-gtvqbht" class="grpSym bounding-box"></g>
                           </g>
                           <g id="mp5zhln" class="measure">
                              <g id="bbox-mp5zhln" class="measure bounding-box"></g>
                              <g id="s4xq9gk" class="staff">
                                 <g id="bbox-s4xq9gk" class="staff bounding-box">
                                    <rect x="7687" y="5927" height="1385" width="30325" fill="transparent"></rect>
                                 </g>
                                 <path d="M7700 5940 L38000 5940" stroke="currentColor" stroke-width="25"></path>
                                 <path d="M7700 6280 L38000 6280" stroke="currentColor" stroke-width="25"></path>
                                 <path d="M7700 6620 L38000 6620" stroke="currentColor" stroke-width="25"></path>
                                 <path d="M7700 6960 L38000 6960" stroke="currentColor" stroke-width="25"></path>
                                 <path d="M7700 7300 L38000 7300" stroke="currentColor" stroke-width="25"></path>
                                 <g id="lsh5vxu" class="layer">
                                    <g id="bbox-lsh5vxu" class="layer bounding-box"></g>
                                    <g id="nd08be142-d54a-4dbf-aa98-0463bf3c0ddb" class="note">
                                       <g id="bbox-nd08be142-d54a-4dbf-aa98-0463bf3c0ddb" class="note bounding-box">
                                          <rect x="12310" y="6609" height="361" width="427" fill="transparent"></rect>
                                       </g>
                                       <g class="notehead">
                                          <use href="#E0A4-1f5wks1" x="12310" y="6790" height="1360px" width="1360px"></use>
                                       </g>
                                       <g id="shwymh9" class="stem">
                                          <g id="bbox-shwymh9" class="stem bounding-box">
                                             <rect x="12703" y="5614" height="1124" width="34" fill="transparent"></rect>
                                          </g>
                                          <rect x="12703" y="5614" height="1124" width="34"></rect>
                                          <g id="f1v9o6mo" class="flag">
                                             <g id="bbox-f1v9o6mo" class="flag bounding-box">
                                                <rect x="12703" y="5614" height="943" width="375" fill="transparent"></rect>
                                             </g>
                                             <use href="#E240-1f5wks1" x="12703" y="5614" height="1360px" width="1360px"></use>
                                          </g>
                                       </g>
                                    </g>
                                    <g id="n5cd8c9cc-9c28-4466-acfd-73a8aa21fb54" class="note">
                                       <g id="bbox-n5cd8c9cc-9c28-4466-acfd-73a8aa21fb54" class="note bounding-box">
                                          <rect x="13410" y="6779" height="361" width="427" fill="transparent"></rect>
                                       </g>
                                       <g class="notehead">
                                          <use href="#E0A4-1f5wks1" x="13410" y="6960" height="1360px" width="1360px"></use>
                                       </g>
                                       <g id="s2m3s5s" class="stem">
                                          <g id="bbox-s2m3s5s" class="stem bounding-box">
                                             <rect x="13410" y="7012" height="956" width="34" fill="transparent"></rect>
                                          </g>
                                          <rect x="13410" y="7012" height="956" width="34"></rect>
                                       </g>
                                    </g>
                                    <g id="n32118f47-882c-4751-91c9-e6ebd1fbabb3" class="note">
                                       <g id="bbox-n32118f47-882c-4751-91c9-e6ebd1fbabb3" class="note bounding-box">
                                          <rect x="13560" y="6099" height="361" width="427" fill="transparent"></rect>
                                       </g>
                                       <g class="notehead">
                                          <use href="#E0A4-1f5wks1" x="13560" y="6280" height="1360px" width="1360px"></use>
                                       </g>
                                       <g id="s1b9jgab" class="stem">
                                          <g id="bbox-s1b9jgab" class="stem bounding-box">
                                             <rect x="13953" y="5272" height="956" width="34" fill="transparent"></rect>
                                          </g>
                                          <rect x="13953" y="5272" height="956" width="34"></rect>
                                       </g>
                                    </g>
                                    <g id="n7dc96fea-eb7b-4fb1-8431-973f316e63c7" class="note">
                                       <g id="bbox-n7dc96fea-eb7b-4fb1-8431-973f316e63c7" class="note bounding-box">
                                          <rect x="14850" y="6609" height="361" width="427" fill="transparent"></rect>
                                       </g>
                                       <g class="notehead">
                                          <use href="#E0A4-1f5wks1" x="14850" y="6790" height="1360px" width="1360px"></use>
                                       </g>
                                       <g id="sb52k3k" class="stem">
                                          <g id="bbox-sb52k3k" class="stem bounding-box">
                                             <rect x="14850" y="6842" height="1012" width="34" fill="transparent"></rect>
                                          </g>
                                          <rect x="14850" y="6842" height="1012" width="34"></rect>
                                       </g>
                                    </g>
                                    <g id="n62064993-5908-488a-b389-f7a366c2b522" class="note">
                                       <g id="bbox-n62064993-5908-488a-b389-f7a366c2b522" class="note bounding-box">
                                          <rect x="15450" y="6269" height="361" width="427" fill="transparent"></rect>
                                       </g>
                                       <g class="notehead">
                                          <use href="#E0A4-1f5wks1" x="15450" y="6450" height="1360px" width="1360px"></use>
                                       </g>
                                       <g id="son0l01" class="stem">
                                          <g id="bbox-son0l01" class="stem bounding-box">
                                             <rect x="15843" y="5386" height="1012" width="34" fill="transparent"></rect>
                                          </g>
                                          <rect x="15843" y="5386" height="1012" width="34"></rect>
                                          <g id="f1ib1s2m" class="flag">
                                             <g id="bbox-f1ib1s2m" class="flag bounding-box">
                                                <rect x="15843" y="5386" height="943" width="375" fill="transparent"></rect>
                                             </g>
                                             <use href="#E240-1f5wks1" x="15843" y="5386" height="1360px" width="1360px"></use>
                                          </g>
                                       </g>
                                    </g>
                                    <g id="nec78f9b5-dbb7-4a61-aa8f-596a164f919c" class="note">
                                       <g id="bbox-nec78f9b5-dbb7-4a61-aa8f-596a164f919c" class="note bounding-box">
                                          <rect x="19100" y="6609" height="361" width="427" fill="transparent"></rect>
                                       </g>
                                       <g class="notehead">
                                          <use href="#E0A4-1f5wks1" x="19100" y="6790" height="1360px" width="1360px"></use>
                                       </g>
                                       <g id="sz0rgzf" class="stem">
                                          <g id="bbox-sz0rgzf" class="stem bounding-box">
                                             <rect x="19493" y="5614" height="1124" width="34" fill="transparent"></rect>
                                          </g>
                                          <rect x="19493" y="5614" height="1124" width="34"></rect>
                                          <g id="f18uoew4" class="flag">
                                             <g id="bbox-f18uoew4" class="flag bounding-box">
                                                <rect x="19493" y="5614" height="943" width="375" fill="transparent"></rect>
                                             </g>
                                             <use href="#E240-1f5wks1" x="19493" y="5614" height="1360px" width="1360px"></use>
                                          </g>
                                       </g>
                                    </g>
                                    <g id="n8d2c5e2b-de5f-4219-b1f7-47d8b2e71610" class="note">
                                       <g id="bbox-n8d2c5e2b-de5f-4219-b1f7-47d8b2e71610" class="note bounding-box">
                                          <rect x="20230" y="7119" height="361" width="427" fill="transparent"></rect>
                                       </g>
                                       <g class="notehead">
                                          <use href="#E0A4-1f5wks1" x="20230" y="7300" height="1360px" width="1360px"></use>
                                       </g>
                                       <g id="s1hzuk3p" class="stem">
                                          <g id="bbox-s1hzuk3p" class="stem bounding-box">
                                             <rect x="20230" y="7352" height="844" width="34" fill="transparent"></rect>
                                          </g>
                                          <rect x="20230" y="7352" height="844" width="34"></rect>
                                       </g>
                                    </g>
                                    <g id="n48c9ec88-21a7-4161-b0fc-a538dbca4274" class="note">
                                       <g id="bbox-n48c9ec88-21a7-4161-b0fc-a538dbca4274" class="note bounding-box">
                                          <rect x="20780" y="6269" height="361" width="427" fill="transparent"></rect>
                                       </g>
                                       <g class="notehead">
                                          <use href="#E0A4-1f5wks1" x="20780" y="6450" height="1360px" width="1360px"></use>
                                       </g>
                                       <g id="snox2tq" class="stem">
                                          <g id="bbox-snox2tq" class="stem bounding-box">
                                             <rect x="21173" y="5386" height="1012" width="34" fill="transparent"></rect>
                                          </g>
                                          <rect x="21173" y="5386" height="1012" width="34"></rect>
                                       </g>
                                    </g>
                                    <g id="ne0855fd7-402f-4b79-aa1c-e1d4755dd308" class="note">
                                       <g id="bbox-ne0855fd7-402f-4b79-aa1c-e1d4755dd308" class="note bounding-box">
                                          <rect x="21220" y="6779" height="361" width="427" fill="transparent"></rect>
                                       </g>
                                       <g class="notehead">
                                          <use href="#E0A4-1f5wks1" x="21220" y="6960" height="1360px" width="1360px"></use>
                                       </g>
                                       <g id="s1aompyr" class="stem">
                                          <g id="bbox-s1aompyr" class="stem bounding-box">
                                             <rect x="21220" y="7012" height="956" width="34" fill="transparent"></rect>
                                          </g>
                                          <rect x="21220" y="7012" height="956" width="34"></rect>
                                       </g>
                                    </g>
                                    <g id="nf6a4b2c2-1fbe-4b2a-bae2-4b0f3580fb38" class="note">
                                       <g id="bbox-nf6a4b2c2-1fbe-4b2a-bae2-4b0f3580fb38" class="note bounding-box">
                                          <rect x="21820" y="6439" height="361" width="427" fill="transparent"></rect>
                                       </g>
                                       <g class="notehead">
                                          <use href="#E0A4-1f5wks1" x="21820" y="6620" height="1360px" width="1360px"></use>
                                       </g>
                                       <g id="s1xnqa5v" class="stem">
                                          <g id="bbox-s1xnqa5v" class="stem bounding-box">
                                             <rect x="22213" y="5500" height="1068" width="34" fill="transparent"></rect>
                                          </g>
                                          <rect x="22213" y="5500" height="1068" width="34"></rect>
                                          <g id="f85hddz" class="flag">
                                             <g id="bbox-f85hddz" class="flag bounding-box">
                                                <rect x="22213" y="5500" height="943" width="375" fill="transparent"></rect>
                                             </g>
                                             <use href="#E240-1f5wks1" x="22213" y="5500" height="1360px" width="1360px"></use>
                                          </g>
                                       </g>
                                    </g>
                                    <g id="nb73cb7de-ee66-4feb-947a-42a9934d9313" class="note">
                                       <g id="bbox-nb73cb7de-ee66-4feb-947a-42a9934d9313" class="note bounding-box">
                                          <rect x="25770" y="6949" height="361" width="427" fill="transparent"></rect>
                                       </g>
                                       <g class="notehead">
                                          <use href="#E0A4-1f5wks1" x="25770" y="7130" height="1360px" width="1360px"></use>
                                       </g>
                                       <g id="s18i3zh4" class="stem">
                                          <g id="bbox-s18i3zh4" class="stem bounding-box">
                                             <rect x="26163" y="5954" height="1124" width="34" fill="transparent"></rect>
                                          </g>
                                          <rect x="26163" y="5954" height="1124" width="34"></rect>
                                          <g id="fbbxtw5" class="flag">
                                             <g id="bbox-fbbxtw5" class="flag bounding-box">
                                                <rect x="26163" y="5954" height="943" width="375" fill="transparent"></rect>
                                             </g>
                                             <use href="#E240-1f5wks1" x="26163" y="5954" height="1360px" width="1360px"></use>
                                          </g>
                                       </g>
                                    </g>
                                    <g id="n82baa979-b90b-4ddf-a777-93aae1b90262" class="note">
                                       <g id="bbox-n82baa979-b90b-4ddf-a777-93aae1b90262" class="note bounding-box">
                                          <rect x="27030" y="7119" height="361" width="427" fill="transparent"></rect>
                                       </g>
                                       <g class="notehead">
                                          <use href="#E0A4-1f5wks1" x="27030" y="7300" height="1360px" width="1360px"></use>
                                       </g>
                                       <g id="s12sx6lp" class="stem">
                                          <g id="bbox-s12sx6lp" class="stem bounding-box">
                                             <rect x="27030" y="7352" height="844" width="34" fill="transparent"></rect>
                                          </g>
                                          <rect x="27030" y="7352" height="844" width="34"></rect>
                                       </g>
                                    </g>
                                    <g id="nf66f45e4-c021-429b-84d7-a96e963f5b5b" class="note">
                                       <g id="bbox-nf66f45e4-c021-429b-84d7-a96e963f5b5b" class="note bounding-box">
                                          <rect x="27610" y="6439" height="361" width="427" fill="transparent"></rect>
                                       </g>
                                       <g class="notehead">
                                          <use href="#E0A4-1f5wks1" x="27610" y="6620" height="1360px" width="1360px"></use>
                                       </g>
                                       <g id="sbniz45" class="stem">
                                          <g id="bbox-sbniz45" class="stem bounding-box">
                                             <rect x="28003" y="5500" height="1068" width="34" fill="transparent"></rect>
                                          </g>
                                          <rect x="28003" y="5500" height="1068" width="34"></rect>
                                       </g>
                                    </g>
                                    <g id="n0c862f1c-64ef-4171-93fa-a81362631fb8" class="note">
                                       <g id="bbox-n0c862f1c-64ef-4171-93fa-a81362631fb8" class="note bounding-box">
                                          <rect x="28540" y="6949" height="361" width="427" fill="transparent"></rect>
                                       </g>
                                       <g class="notehead">
                                          <use href="#E0A4-1f5wks1" x="28540" y="7130" height="1360px" width="1360px"></use>
                                       </g>
                                       <g id="sa2oonp" class="stem">
                                          <g id="bbox-sa2oonp" class="stem bounding-box">
                                             <rect x="28540" y="7182" height="900" width="34" fill="transparent"></rect>
                                          </g>
                                          <rect x="28540" y="7182" height="900" width="34"></rect>
                                       </g>
                                    </g>
                                    <g id="ne3427f17-33af-4943-a8ab-0659514fe2b1" class="note">
                                       <g id="bbox-ne3427f17-33af-4943-a8ab-0659514fe2b1" class="note bounding-box">
                                          <rect x="29060" y="6779" height="361" width="427" fill="transparent"></rect>
                                       </g>
                                       <g class="notehead">
                                          <use href="#E0A4-1f5wks1" x="29060" y="6960" height="1360px" width="1360px"></use>
                                       </g>
                                       <g id="s18vt61t" class="stem">
                                          <g id="bbox-s18vt61t" class="stem bounding-box">
                                             <rect x="29453" y="5784" height="1124" width="34" fill="transparent"></rect>
                                          </g>
                                          <rect x="29453" y="5784" height="1124" width="34"></rect>
                                       </g>
                                    </g>
                                    <g id="nd6ccaa68-b5a3-4650-8b79-18209a7a9e8a" class="note">
                                       <g id="bbox-nd6ccaa68-b5a3-4650-8b79-18209a7a9e8a" class="note bounding-box">
                                          <rect x="32940" y="6099" height="361" width="427" fill="transparent"></rect>
                                       </g>
                                       <g class="notehead">
                                          <use href="#E0A4-1f5wks1" x="32940" y="6280" height="1360px" width="1360px"></use>
                                       </g>
                                       <g id="s3axnrk" class="stem">
                                          <g id="bbox-s3axnrk" class="stem bounding-box">
                                             <rect x="33333" y="5272" height="956" width="34" fill="transparent"></rect>
                                          </g>
                                          <rect x="33333" y="5272" height="956" width="34"></rect>
                                          <g id="f1wovjtj" class="flag">
                                             <g id="bbox-f1wovjtj" class="flag bounding-box">
                                                <rect x="33333" y="5272" height="943" width="375" fill="transparent"></rect>
                                             </g>
                                             <use href="#E240-1f5wks1" x="33333" y="5272" height="1360px" width="1360px"></use>
                                          </g>
                                       </g>
                                    </g>
                                    <g id="n7fe32498-e6db-4ae6-aab0-d99cf14bbb61" class="note">
                                       <g id="bbox-n7fe32498-e6db-4ae6-aab0-d99cf14bbb61" class="note bounding-box">
                                          <rect x="33930" y="6772" height="367" width="427" fill="transparent"></rect>
                                       </g>
                                       <g class="notehead">
                                          <use href="#E0A3-1f5wks1" x="33930" y="6960" height="1360px" width="1360px"></use>
                                       </g>
                                       <g id="sds659z" class="stem">
                                          <g id="bbox-sds659z" class="stem bounding-box">
                                             <rect x="33930" y="7007" height="961" width="34" fill="transparent"></rect>
                                          </g>
                                          <rect x="33930" y="7007" height="961" width="34"></rect>
                                       </g>
                                    </g>
                                    <g id="n0d6f084d-9f9e-46bc-b9d2-2936227872b2" class="note">
                                       <g id="bbox-n0d6f084d-9f9e-46bc-b9d2-2936227872b2" class="note bounding-box">
                                          <rect x="34670" y="6269" height="361" width="427" fill="transparent"></rect>
                                       </g>
                                       <g class="notehead">
                                          <use href="#E0A4-1f5wks1" x="34670" y="6450" height="1360px" width="1360px"></use>
                                       </g>
                                       <g id="s1btdb1p" class="stem">
                                          <g id="bbox-s1btdb1p" class="stem bounding-box">
                                             <rect x="35063" y="5386" height="1012" width="34" fill="transparent"></rect>
                                          </g>
                                          <rect x="35063" y="5386" height="1012" width="34"></rect>
                                       </g>
                                    </g>
                                    <g id="n5e152ada-ca5d-487c-a53c-1a2a6c0dc803" class="note">
                                       <g id="bbox-n5e152ada-ca5d-487c-a53c-1a2a6c0dc803" class="note bounding-box">
                                          <rect x="36040" y="6439" height="361" width="427" fill="transparent"></rect>
                                       </g>
                                       <g class="notehead">
                                          <use href="#E0A4-1f5wks1" x="36040" y="6620" height="1360px" width="1360px"></use>
                                       </g>
                                       <g id="stq7cua" class="stem">
                                          <g id="bbox-stq7cua" class="stem bounding-box">
                                             <rect x="36433" y="5500" height="1068" width="34" fill="transparent"></rect>
                                          </g>
                                          <rect x="36433" y="5500" height="1068" width="34"></rect>
                                          <g id="f10p234s" class="flag">
                                             <g id="bbox-f10p234s" class="flag bounding-box">
                                                <rect x="36433" y="5500" height="943" width="375" fill="transparent"></rect>
                                             </g>
                                             <use href="#E240-1f5wks1" x="36433" y="5500" height="1360px" width="1360px"></use>
                                          </g>
                                       </g>
                                    </g>
                                    <g id="a6f5e2afa-4ee8-4663-9d15-780732cc9ff3" class="accid">
                                       <g id="bbox-a6f5e2afa-4ee8-4663-9d15-780732cc9ff3" class="accid bounding-box">
                                          <rect x="12850" y="6648" height="943" width="267" fill="transparent"></rect>
                                       </g>
                                       <use href="#E262-1f5wks1" x="12850" y="7130" height="1360px" width="1360px"></use>
                                    </g>
                                    <g id="ae2ce618c-c3ec-43c9-b27d-70c3e02c5ad4" class="accid">
                                       <g id="bbox-ae2ce618c-c3ec-43c9-b27d-70c3e02c5ad4" class="accid bounding-box">
                                          <rect x="19780" y="6818" height="943" width="267" fill="transparent"></rect>
                                       </g>
                                       <use href="#E262-1f5wks1" x="19780" y="7300" height="1360px" width="1360px"></use>
                                    </g>
                                    <g id="ac1897725-0917-44ae-8c24-60aea599bebf" class="accid">
                                       <g id="bbox-ac1897725-0917-44ae-8c24-60aea599bebf" class="accid bounding-box">
                                          <rect x="20370" y="5973" height="954" width="213" fill="transparent"></rect>
                                       </g>
                                       <use href="#E261-1f5wks1" x="20370" y="6450" height="1360px" width="1360px"></use>
                                    </g>
                                    <g id="ab7f52cf4-c174-4a6e-8ab9-9ec2ff439666" class="accid">
                                       <g id="bbox-ab7f52cf4-c174-4a6e-8ab9-9ec2ff439666" class="accid bounding-box">
                                          <rect x="26430" y="6818" height="943" width="267" fill="transparent"></rect>
                                       </g>
                                       <use href="#E262-1f5wks1" x="26430" y="7300" height="1360px" width="1360px"></use>
                                    </g>
                                    <g id="a8a841e6f-ac8b-460d-8fe7-eb3524b65a77" class="accid">
                                       <g id="bbox-a8a841e6f-ac8b-460d-8fe7-eb3524b65a77" class="accid bounding-box">
                                          <rect x="27190" y="6143" height="954" width="213" fill="transparent"></rect>
                                       </g>
                                       <use href="#E261-1f5wks1" x="27190" y="6620" height="1360px" width="1360px"></use>
                                    </g>
                                    <g id="bf5e408ea-a3bf-4a68-9569-2b6d6c37d3e8" class="barLine">
                                       <g id="bbox-bf5e408ea-a3bf-4a68-9569-2b6d6c37d3e8" class="barLine bounding-box">
                                          <rect x="18000" y="5914" height="1411" width="51" fill="transparent"></rect>
                                       </g>
                                       <path d="M18026 5940 L18026 7300" stroke="currentColor" stroke-width="51"></path>
                                    </g>
                                    <g id="bbed85379-7751-4300-b96b-0f6eb2cab2bf" class="barLine">
                                       <g id="bbox-bbed85379-7751-4300-b96b-0f6eb2cab2bf" class="barLine bounding-box">
                                          <rect x="23600" y="5914" height="1411" width="51" fill="transparent"></rect>
                                       </g>
                                       <path d="M23626 5940 L23626 7300" stroke="currentColor" stroke-width="51"></path>
                                    </g>
                                    <g id="b981464b4-28b2-40c6-9e92-e1a91ab98433" class="barLine">
                                       <g id="bbox-b981464b4-28b2-40c6-9e92-e1a91ab98433" class="barLine bounding-box">
                                          <rect x="31300" y="5914" height="1411" width="51" fill="transparent"></rect>
                                       </g>
                                       <path d="M31326 5940 L31326 7300" stroke="currentColor" stroke-width="51"></path>
                                    </g>
                                    <g id="b21da71b3-3eeb-4df6-afbf-addc4577834e" class="barLine">
                                       <g id="bbox-b21da71b3-3eeb-4df6-afbf-addc4577834e" class="barLine bounding-box">
                                          <rect x="37800" y="5914" height="1411" width="238" fill="transparent"></rect>
                                       </g>
                                       <path d="M37826 5940 L37826 7300" stroke="currentColor" stroke-width="51"></path>
                                       <path d="M38013 5940 L38013 7300" stroke="currentColor" stroke-width="51"></path>
                                    </g>
                                 </g>
                              </g>
                              <g id="b1f55bnh" class="barLine">
                                 <g id="bbox-b1f55bnh" class="barLine bounding-box">
                                    <rect x="7686" y="5926" height="1387" width="27" fill="transparent"></rect>
                                 </g>
                                 <path d="M7700 5940 L7700 7300" stroke="currentColor" stroke-width="27"></path>
                              </g>
                           </g>
                        </g>
                     </g>
                  </svg>
               </svg>
              </div>
            </pane>
            <pane>
               <h1>Appears</h1>
               Offsets: x={{alignmentOffset.x}} | y={{alignmentOffset.y}}
               <table class="table table-striped">
                  <thead>
                     <tr>
                        <th>x</th>
                        <th>y</th>
                        <th>dx</th>
                        <th>dy</th>
                        <th>diplo x</th>
                        <th>diplo y</th>
                     </tr>
                  </thead>
                  <tbody>
                     <tr v-for="(p, i) in alignedPairs" :key="i" :title="p.id">
                        <td>{{p.x}}</td>
                        <td>{{p.y}}</td>
                        <td>{{p.dx}}</td>
                        <td>{{p.dy}}</td>
                        <td>{{p.diploX}}</td>
                        <td>{{p.diploY}}</td>
                     </tr>
                  </tbody>
               </table>
            </pane>
          </splitpanes>
        </div>
        <div>{{gsap}}</div>
      </div>
      <div class="modal-footer">
        <div class="btn-group">
          <button class="btn" @click="closeModal()">Close</button>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
// import createVerovioModule from 'verovio/wasm'
// import { VerovioToolkit } from 'verovio/esm'
import verovio from 'verovio'

const verovioOptions = {
  scale: 30,
  breaks: 'none',
  openControlEvents: true,
  svgBoundingBoxes: true,
  svgRemoveXlink: true,
  header: 'none',
  footer: 'none',
  pageWidth: 3800,
  pageHeight: 800,
  unit: 17
}

export default {
  name: 'TranscriptionAlignmentModal',
  components: {
    Splitpanes,
    Pane
  },
  methods: {
    closeModal () {
      this.$store.dispatch('setModal', null)
    },
    shapeClick (e, file) {
      const t = e.target.closest('.note, .accid, .keyAccid')
      if (t !== null) {
        const x = t.getBBox().x
        console.log('clicked on ' + t.id + ' in file ' + file + ' at x=' + x)
        this.$store.dispatch('clickAlignmentShape', { shape: t, file })
      } else {
        console.log('clicked on something wrong')
      }
    }
  },
  computed: {
    active () {
      return this.$store.getters.modal === 'transcriptionAlignment'
    },
    alignmentMode () {
      return this.$store.getters.alignmentMode
    },
    alignmentTemp () {
      return this.$store.getters.alignmentTemp
    },
    alignedPairs () {
      return this.$store.getters.alignedPairs
    },
    alignmentOffset () {
      return this.$store.getters.alignmentOffset
    },
    gsap () {
      const pairs = this.$store.getters.alignedPairs
      // https://edirom-images.beethovens-werkstatt.de/Scaler/IIIF/D-BNba_HCB_Mh_60%2FHCB_Mh_60_05.jpg/500,3100,4024,1100/3000,/0/default.jpg

      let str = 'const tl = gsap.timeline({repeat: 2, repeatDelay: 1}) \n tl.from(".supplied", { opacity: 0, duration: 2}, 0)\n'
      pairs.forEach(item => {
        const diffX = item.dx - parseInt(item.x)
        const diffY = item.dy - parseInt(item.y)

        if (diffX !== 0 && diffY !== 0) {
          str += 'tl.from("#' + item.id + '", { x: ' + diffX + ', y: ' + diffY + ', duration: 2}, 0)\n'
        } else if (diffX !== 0) {
          str += 'tl.from("#' + item.id + '", { x: ' + diffX + ', duration: 2}, 0)\n'
        } else if (diffY !== 0) {
          str += 'tl.from("#' + item.id + '", { y: ' + diffY + ', duration: 2}, 0)\n'
        }
      })
      return str
    }
  },
  mounted () {
    const diplomatic = document.querySelector('.diplomatic.transcript svg')
    const diplFunc = (e) => {
      this.shapeClick(e, 'diplomatic')
    }
    diplomatic.addEventListener('click', diplFunc)

    setTimeout(() => {
      // eslint-disable-next-line
      this.vrvToolkit = new verovio.toolkit()
      this.vrvToolkit.setOptions(verovioOptions)

      fetch('./assets/annotatedTranscript.mei')
        .then(res => res.text())
        .then(mei => {
          console.log('received MEI')
          this.vrvToolkit.loadData(mei)
          const svg = this.vrvToolkit.renderToSVG(1, {})
          const container = document.querySelector('.annotated.transcript')

          container.innerHTML = svg

          const annotFunc = (e) => {
            this.shapeClick(e, 'annotated')
          }
          container.querySelector('svg').addEventListener('click', annotFunc)
        })
    }, 1000)

    this.$store.watch((state, getters) => getters.alignmentRefDiplo,
      (newId, oldId) => {
        document.querySelectorAll('#' + oldId).forEach(shape => shape.classList.remove('ref'))
        document.querySelectorAll('#' + newId).forEach(shape => shape.classList.add('ref'))
      })
    this.$store.watch((state, getters) => getters.alignmentRefAnnot,
      (newId, oldId) => {
        document.querySelectorAll('#' + oldId).forEach(shape => shape.classList.remove('ref'))
        document.querySelectorAll('#' + newId).forEach(shape => shape.classList.add('ref'))
      })
    this.$store.watch((state, getters) => getters.alignmentTemp,
      (newId, oldId) => {
        document.querySelectorAll('#' + oldId).forEach(shape => shape.classList.remove('temp'))
        document.querySelectorAll('#' + newId).forEach(shape => shape.classList.add('temp'))
      })
    this.$store.watch((state, getters) => getters.alignmentCovered,
      (newArr, oldArr) => {
        newArr.forEach(newId => {
          document.querySelectorAll('#' + newId).forEach(shape => shape.classList.add('covered'))
        })
      })
  },
  unmounted () {

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
@import '@/css/_variables.scss';
#transcriptionAlignment-modal .modal-container {
   max-width: 95vw;
   height: 95vh;
   max-height: 95vh;

   h1 {
      font-size: 1rem;
      font-weight: bold;
   }

   .modal-footer {

   }

   .transcript {
      overflow: auto;
   }

   .ref {
      stroke: red;
      fill: red;
   }

   .temp {
      stroke: blue;
      fill: blue;
   }

   .covered {
      stroke: green;
      fill: green;
   }

   .supplied {
      stroke: #999999;
      fill: #999999;
   }
}
</style>

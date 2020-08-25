/*
Program       esci-correlation.js
Author        Gordon Moore
Date          20 August 2020
Description   The JavaScript code for esci-correlation
Licence       GNU General Public Licence Version 3, 29 June 2007
*/

// #region Version history
/*
0.0.1   Initial version

*/
//#endregion 

let version = '0.0.1';

'use strict';
$(function() {
  console.log('jQuery here!');  //just to make sure everything is working

  //#region for variable definitions (just allows code folding)
  let tooltipson              = false;                                        //toggle the tooltips on or off

  let tab                     = 'correlation';  

  const display               = document.querySelector('#display');        //display of pdf area

  let realHeight              = 100;                                          //the real world height for the pdf display area
  let margin                  = {top: 0, right: 10, bottom: 0, left: 70};     //margins for pdf display area
  let width;                                                                  //the true width of the pdf display area in pixels
  let heightP;   
  let rwidth;                                                                 //the width returned by resize
  let rheight;                                                                //the height returned by resize
  
  let left;
  let right;

  let pauseId;
  let repeatId;
  let delay = 50;
  let pause = 500;

  let sliderinuse = false;

  //tab 1 panel 1 N1
  let $N1slider;
  let N1 = 4;
  const $N1val = $('#N1val');
  $N1val.val(N1.toFixed(0));
  const $N1nudgebackward = $('#N1nudgebackward');
  const $N1nudgeforward = $('#N1nudgeforward');

  //tab 1 panel 2 r
  let $rslider;
  let r = 0.5;
  const $rval = $('#rval');
  $rval.val(r.toFixed(2).toString().replace('0.', '.'));
  const $calculatedr = $('#calculatedr');
  const $rnudgebackward = $('#rnudgebackward');
  const $rnudgeforward = $('#rnudgeforward');

  //tab 1 panel 3 New data set
  const $newdataset = $('#newdataset');
  
  //tab 1 panel 4 Display features
  const $displayr = $('#displayr');
  let displayr;

  const $displayctm = $('#displayctm');
  let displayctm;

  const $displaymd = $('#displaymd');
  let displaymd;

  //tab 1 panel 5 Descriptive statstics
  const $statistics1 = $('#statistics1');
  const $statistics1show = $('#statistics1show');
  let statistics1show = false;

  
  //tab 1 panel 6 Display lines
  const $displaylines1 = $('#displaylines1');
  const $displaylines1show = $('#displaylines1show');
  let displaylines1show = false;

  const $corryx = $('#corryx');
  let corryx;
  
  const $corrxy = $('#corrxy');
  let corrxy;

  const $corrlineslope = $('#corrlineslope');
  let corrlineslope;

  //tab 2 panel 1 N2
  let $N2slider;
  let N2 = 4;
  const $N2val = $('#N2val');
  $N2val.val(N2.toFixed(0));
  const $N2nudgebackward = $('#N2nudgebackward');
  const $N2nudgeforward = $('#N2nudgeforward');
  
  //tab 2 panel 2 rho
  let $rhoslider;
  let rho = 0.5;
  const $rhoval = $('#rhoval');
  $rhoval.val(rho.toFixed(2).toString().replace('0.', '.'));
  const $calculatedrho = $('#calculatedrho');
  const $rhonudgebackward = $('#rhonudgebackward');
  const $rhonudgeforward = $('#rhonudgeforward');


  let svgD;   
                                                                              //the svg reference to pdfdisplay
  const $display            = $('#display');

  //api for getting width, height of element - only gets element, not entire DOM
  // https://www.digitalocean.com/comxbarcontrolnity/tutorials/js-resize-observer
  const resizeObserver = new ResizeObserver(entries => {
    entries.forEach(entry => {
      rwidth = entry.contentRect.width;
      //rHeight = entry.contentRect.height;  //doesn't work
      rheight = $('#display').outerHeight(true);
    });
  });

  //#endregion

  //breadcrumbs
  $('#homecrumb').on('click', function() {
    window.location.href = "https://www.esci.thenewstatistics.com/";
  })

  initialise();

  function initialise() {

    //tabs
    $('#smarttab').smartTab({
      selected: 0, // Initial selected tab, 0 = first tab
      theme: 'round', // theme for the tab, related css need to include for other than default theme
      orientation: 'horizontal', // Nav menu orientation. horizontal/vertical
      justified: true, // Nav menu justification. true/false
      autoAdjustHeight: true, // Automatically adjust content height
      backButtonSupport: true, // Enable the back button support
      enableURLhash: true, // Enable selection of the tab based on url hash
      transition: {
          animation: 'none', // Effect on navigation, none/fade/slide-horizontal/slide-vertical/slide-swing
          speed: '400', // Transion animation speed
          //easing:'' // Transition animation easing. Not supported without a jQuery easing plugin
      },
      autoProgress: { // Auto navigate tabs on interval
          enabled: false, // Enable/Disable Auto navigation
          interval: 3500, // Auto navigate Interval (used only if "autoProgress" is set to true)
          stopOnFocus: true, // Stop auto navigation on focus and resume on outfocus
      },
      keyboardSettings: {
          keyNavigation: true, // Enable/Disable keyboard navigation(left and right keys are used if enabled)
          keyLeft: [37], // Left key code
          keyRight: [39] // Right key code
      }
    });    

    setTooltips();

    //get initial values for height/width
    rwidth  = $('#display').outerWidth(true);
    rheight = $('#display').outerHeight(true);

    d3.selectAll('svg > *').remove();  //remove all elements under svgP
    $('svg').remove();                 //remove the all svg elements from the DOM

    //pdf display
    svgD = d3.select('#display').append('svg').attr('width', '100%').attr('height', '100%');

    setupSliders(); 

    resize();

    clear();

  }

  //Switch tabs
  $("#smarttab").on("showTab", function(e, anchorObject, tabIndex) {
    if (tabIndex === 0) {
      tab = 'correlation';

    }
    if (tabIndex === 1) {
      tab = 'Dance r';

    }

    setupSliders();

    clear();
  });  

  function resize() {
    //have to watch out as the width and height do not always seem precise to pixels
    //browsers apparently do not expose true element width, height.
    //also have to think about box model. outerwidth(true) gets full width, not sure resizeObserver does.

    resizeObserver.observe(display);  //note doesn't get true outer width, height

    width   = rwidth - margin.left - margin.right;  
    heightP = rheight - margin.top - margin.bottom;

    clear();
  }


  function setupSliders() {

    $('#N1slider').ionRangeSlider({
      skin: 'big',
      grid: true,
      grid_num: 6,
      type: 'single',
      min: 0,
      max: 300,
      from: 4,
      step: 1,
      prettify: prettify0,
      //on slider handles change
      onChange: function (data) {
        N1 = data.from;
        sliderinuse = true;  //don't update dslider in updateN1()
        updateN1();
        $N1val.val(N1.toFixed(0));
        redrawDisplay();
      }
    })
    $N1slider = $('#N1slider').data("ionRangeSlider");

    $('#rslider').ionRangeSlider({
      skin: 'big',
      grid: true,
      grid_num: 4,
      type: 'single',
      min: -1,
      max: 1,
      from: 0.5,
      step: 0.01,
      prettify: prettify2,
      //on slider handles change
      onChange: function (data) {
        r = data.from;
        sliderinuse = true;  //don't update dslider in updater()
        updater();
        $rval.val(r.toFixed(2).toString().replace('0.', '.'));
        $calculatedr.text(r.toFixed(2).toString().replace('0.', '.'))
        redrawDisplay();
      }
    })
    $rslider = $('#rslider').data("ionRangeSlider");

    $('#N2slider').ionRangeSlider({
      skin: 'big',
      grid: true,
      grid_num: 6,
      type: 'single',
      min: 0,
      max: 300,
      from: 4,
      step: 1,
      prettify: prettify0,
      //on slider handles change
      onChange: function (data) {
        N2 = data.from;
        sliderinuse = true;  //don't update dslider in updateN2()
        updateN2();
        $N2val.val(N2.toFixed(0));
        redrawDisplay();
      }
    })
    $N2slider = $('#N2slider').data("ionRangeSlider");


    $('#rhoslider').ionRangeSlider({
      skin: 'big',
      grid: true,
      grid_num: 4,
      type: 'single',
      min: -1,
      max: 1,
      from: 0.5,
      step: 0.01,
      prettify: prettify2,
      //on slider handles change
      onChange: function (data) {
        rho = data.from;
        sliderinuse = true;  //don't update dslider in updaterho()
        updater();
        $rhoval.val(rho.toFixed(2).toString().replace('0.', '.'));
        $calculatedrho.text(rho.toFixed(2).toString().replace('0.', '.'))

        redrawDisplay();
      }
    })
    $rhoslider = $('#rhoslider').data("ionRangeSlider");

  }


  function updateN1() {
    if (!sliderinuse) $N1slider.update({ from: N1 })
    sliderinuse = false;
    redrawDisplay();
  }

  function updateN2() {
    if (!sliderinuse) $N2slider.update({ from: N2 })
    sliderinuse = false;
    redrawDisplay();
  }

  function updater() {
    if (!sliderinuse) $rslider.update({ from: r })
    sliderinuse = false;
    redrawDisplay();
  }

  function updaterho() {
    if (!sliderinuse) $rhoslider.update({ from: rho })
    sliderinuse = false;
    redrawDisplay();
  }


  function prettify0(n) {
    return n.toFixed(0);
  }

  function prettify1(n) {
    return n.toFixed(1).toString().replace('0.', '.');
  }

  function prettify2(n) {
    return n.toFixed(2).toString().replace('0.', '.');
  }


  //set everything to a default state.
  function clear() {
    //set sliders to initial


    N1 = 4;
    updateN1();
    $N1val.text(N1.toFixed(0));

    N2 = 4;
    updateN2();
    $N2val.text(N2.toFixed(0));

    r = 0.5;
    updater();
    $rval.text(r.toFixed(2).toString().replace('0.', '.'));    
    $calculatedr.text(r.toFixed(2).toString().replace('0.', '.')); 

    rho = 0.5;
    updater();
    $rhoval.text(rho.toFixed(2).toString().replace('0.', '.'));  
    $calculatedrho.text(rho.toFixed(2).toString().replace('0.', '.')); 

    //$statistics1.hide();
    //$statistics1.css('display', 'none');
    //$displaylines1.hide();
    //$displaylines1.css('display', 'none');
  }

  function redrawDisplay() {

  }

  /*--------------------------------------New Data Set----------------*/ 

  $newdataset.on('change', function() {  //button

  })

  /*--------------------------------------Display Features-------------*/

  $displayr.on('change', function() {
    displayr = $displayr.is(':checked');

  })

  $displayctm.on('change', function() {
    displayctm = $displayctm.is(':checked');

  })

  $displaymd.on('change', function() {
    displaymd = $displaymd.is(':checked');

  })


//show statistics
$statistics1show.on('change', function() {
  statistics1show = $statistics1show.prop('checked');
  if (statistics1show) {
    $statistics1.show();
  }
  else {
    $statistics1.hide();
  }

})


//show display lines
$displaylines1show.on('change', function() {
  displaylines1show = $displaylines1show.prop('checked');
  if (displaylines1show) {
    $displaylines1.show();
  }
  else {
    $displaylines1.hide();
  }
})

$corryx.on('change', function() {
  corryx = $corryx.is(':checked');

})

$corrxy.on('change', function() {
  corrxy = $xorrxy.is(':checked');

})

$corrlineslope.on('change', function() {
  corrlineslope = $corrlineslope.is(':checked');

})

/*----------------------------------------N1 nudge bars-----------*/
  //changes to N
  $N1val.on('change', function() {
    if ( isNaN($N1val.val()) ) {
      $N1val.val(N1.toFixed(0));
      return;
    };
    N1 = parseFloat($N1val.val()).toFixed(0);
    if (N1 < 4) {
      N1 = 4;
    }
    if (N1 > 300) {
      N1 = 300;
    }
    $N1val.val(N1.toFixed(0));
    updateN1();
  })

  $N1nudgebackward.on('mousedown', function() {
    N1nudgebackward();
    pauseId = setTimeout(function() {
      repeatId = setInterval ( function() {
        N1nudgebackward();
      }, delay );
    }, pause)
  })

  $N1nudgebackward.on('mouseup', function() {
    clearInterval(repeatId);
    clearTimeout(pauseId);
  })

  function N1nudgebackward() {
    N1 -= 1;
    if (N1 < 4) N = 4;
    $N1val.val(N1.toFixed(0));
    updateN1();
  }

  $N1nudgeforward.on('mousedown', function() {
    N1nudgeforward();
    pauseId = setTimeout(function() {
      repeatId = setInterval ( function() {
        N1nudgeforward();
      }, delay );
    }, pause)
  })

  $N1nudgeforward.on('mouseup', function() {
    clearInterval(repeatId);
    clearTimeout(pauseId);
  })

  function N1nudgeforward() {
    N1 += 1;
    if (N1 > 300) N1 = 300;
    $N1val.val(N1.toFixed(0));
    updateN1();
  }

/*----------------------------------------r nudge bars-----------*/
  //changes to r
  $rval.on('change', function() {
    if ( isNaN($rval.val()) ) {
      $rval.val(r.toFixed(2).toString().replace('0.', '.'));
      $calculatedr.text(r.toFixed(2).toString().replace('0.', '.'));
      return;
    };
    r = parseFloat($rval.val());
    if (r < -1) {
      r = -1;
    }
    if (r > 1) {
      r = 1;
    }
    $rval.val(r.toFixed(2).toString().replace('0.', '.'));
    $calculatedr.text(r.toFixed(2).toString().replace('0.', '.'));
    updater();
  })

  $rnudgebackward.on('mousedown', function() {
    rnudgebackward();
    pauseId = setTimeout(function() {
      repeatId = setInterval ( function() {
        rnudgebackward();
      }, delay );
    }, pause)
  })

  $rnudgebackward.on('mouseup', function() {
    clearInterval(repeatId);
    clearTimeout(pauseId);
  })

  function rnudgebackward() {
    r -= 0.01;
    if (r < -1) r = -1;
    $rval.val(r.toFixed(2).toString().replace('0.', '.'));
    $calculatedr.text(r.toFixed(2).toString().replace('0.', '.'));
    updater();
  }

  $rnudgeforward.on('mousedown', function() {
    rnudgeforward();
    pauseId = setTimeout(function() {
      repeatId = setInterval ( function() {
        rnudgeforward();
      }, delay );
    }, pause)
  })

  $rnudgeforward.on('mouseup', function() {
    clearInterval(repeatId);
    clearTimeout(pauseId);
  })

  function rnudgeforward() {
    r += 0.01;
    if (r > 1) r = 1;
    $rval.val(r.toFixed(1).toString().replace('0.', '.'));
    $calculatedr.text(r.toFixed(2).toString().replace('0.', '.'));
    updater();
  }


/*----------------------------------------N2 nudge bars-----------*/
  //changes to N
  $N2val.on('change', function() {
    if ( isNaN($N2val.val()) ) {
      $N2val.val(N.toFixed(0));
      return;
    };
    N2 = parseFloat($N2val.val()).toFixed(0);
    if (N2 < 4) {
      N2 = 4;
    }
    if (N2 > 300) {
      N2 = 300;
    }
    $N2val.val(N2.toFixed(0));
    updateN2();
  })

  $N2nudgebackward.on('mousedown', function() {
    N2nudgebackward();
    pauseId = setTimeout(function() {
      repeatId = setInterval ( function() {
        N2nudgebackward();
      }, delay );
    }, pause)
  })

  $N2nudgebackward.on('mouseup', function() {
    clearInterval(repeatId);
    clearTimeout(pauseId);
  })

  function N2nudgebackward() {
    N2 -= 1;
    if (N2 < 4) N2 = 4;
    $N2val.val(N2.toFixed(0));
    updateN2();
  }

  $N2nudgeforward.on('mousedown', function() {
    N2nudgeforward();
    pauseId = setTimeout(function() {
      repeatId = setInterval ( function() {
        N2nudgeforward();
      }, delay );
    }, pause)
  })

  $N2nudgeforward.on('mouseup', function() {
    clearInterval(repeatId);
    clearTimeout(pauseId);
  })

  function N2nudgeforward() {
    N2 += 1;
    if (N2 > 300) N2 = 300;
    $N2val.val(N2.toFixed(0));
    updateN2();
  }


/*----------------------------------------rho nudge bars-----------*/
  //changes to rho
  $rhoval.on('change', function() {
    if ( isNaN($rhoval.val()) ) {
      $rhoval.val(rho.toFixed(2).toString().replace('0.', '.'));
      $calculatedrho.text(rho.toFixed(2).toString().replace('0.', '.'));
      return;
    };
    rho = parseFloat($rval.val());
    if (rho < -1) {
      rho = -1;
    }
    if (rho > 1) {
      rho = 1;
    }
    $rhoval.val(rho.toFixed(2).toString().replace('0.', '.'));
    $calculatedrho.text(rho.toFixed(2).toString().replace('0.', '.'));
    updaterho();
  })

  $rhonudgebackward.on('mousedown', function() {
    rhonudgebackward();
    pauseId = setTimeout(function() {
      repeatId = setInterval ( function() {
        rhonudgebackward();
      }, delay );
    }, pause)
  })

  $rhonudgebackward.on('mouseup', function() {
    clearInterval(repeatId);
    clearTimeout(pauseId);
  })

  function rhonudgebackward() {
    rho -= 0.01;
    if (rho < -1) rho = -1;
    $rhoval.val(rho.toFixed(1).toString().replace('0.', '.'));
    $calculatedrho.text(rho.toFixed(2).toString().replace('0.', '.'));
    updaterho();
  }

  $rhonudgeforward.on('mousedown', function() {
    rhonudgeforward();
    pauseId = setTimeout(function() {
      repeatId = setInterval ( function() {
        rhonudgeforward();
      }, delay );
    }, pause)
  })

  $rhonudgeforward.on('mouseup', function() {
    clearInterval(repeatId);
    clearTimeout(pauseId);
  })

  function rhonudgeforward() {
    rho += 0.01;
    if (rho > 1) rho = 1;
    $rhoval.val(rho.toFixed(1).toString().replace('0.', '.'));
    $calculatedrho.text(rho.toFixed(2).toString().replace('0.', '.'));
    updaterho();
  }


  /*---------------------------------------------Tooltips on or off-------------------------------------- */

  function setTooltips() {
    Tipped.setDefaultSkin('esci');

    //heading section
    Tipped.create('#logo',          'Version: '+version,                              { skin: 'red', size: 'versionsize', behavior: 'mouse', target: 'mouse', maxWidth: 250, hideOthers: true, hideOnClickOutside: true, hideAfter: 0 });
  
    Tipped.create('#tooltipsonoff', 'Tips on/off, default is off!',                   { skin: 'esci', size: 'xlarge', showDelay: 750, behavior: 'mouse', target: 'mouse', maxWidth: 250, hideOthers: true, hideOnClickOutside: true, hideAfter: 0 });

    Tipped.create('.headingtip',    'https://thenewstatistics.com',                   { skin: 'esci', size: 'xlarge', showDelay: 750, behavior: 'mouse', target: 'mouse', maxWidth: 250, hideOthers: true, hideOnClickOutside: true, hideAfter: 0 });

    Tipped.create('.hometip',       'Click to return to esci Home',                   { skin: 'esci', size: 'xlarge', showDelay: 750, behavior: 'mouse', target: 'mouse', maxWidth: 250, hideOthers: true, hideOnClickOutside: true, hideAfter: 0 });

    

    //spare
    // Tipped.create('. tip', '', { skin: 'esci', size: 'xlarge', showDelay: 750, behavior: 'mouse', target: 'mouse', maxWidth: 250, hideOthers: true, hideOnClickOutside: true, hideAfter: 0 });

    Tipped.disable('[data-tooltip]');
  }

  $('#tooltipsonoff').on('click', function() {
    if (tooltipson) {
      tooltipson = false;
      $('#tooltipsonoff').css('background-color', 'lightgrey');
    }
    else {
      tooltipson = true;
      $('#tooltipsonoff').css('background-color', 'lightgreen');
      Tipped.enable('[data-tooltip]');
    }
  })


  /*----------------------------------------------------------footer----------------------------------------*/
 
  $('#footer').on('click', function() {
    window.location.href = "https://thenewstatistics.com/";
  })

  /*---------------------------------------------------------  resize event -----------------------------------------------*/
  $(window).bind('resize', function(e){
    window.resizeEvt;
    $(window).resize(function(){
        clearTimeout(window.resizeEvt);
        window.resizeEvt = setTimeout(function(){
          resize();
        }, 500);
    });
  });

  //helper function for testing
  function lg(s) {
    console.log(s);
  }  

})


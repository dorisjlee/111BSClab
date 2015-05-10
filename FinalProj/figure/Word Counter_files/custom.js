var box = $("#box");

var DaleChallIndex = function(text, sentence_count) {
    this.text = text;
    this.sentence_count = sentence_count;
};

DaleChallIndex.prototype.getReadingLevel = function() {
    var readability;
    var index = this.getIndex();
    if (index > 10) {
        readability = "College Graduate";
    } else if (index > 9) {
        readability = "College Student";
    } else if (index > 8) {
        readability = "11-12th Grade";
    } else if(index > 7) {
        readability = "9-10th Grade";
    } else if(index > 6) {
        readability = "7-8th Grade";
    } else if(index > 5) {
        readability = "5-6th Grade";
    } else {
        readability = "< 4th Grade";
    }
    return readability;
};

DaleChallIndex.prototype.getIndex = function() {
    var difficult_words = this.getDifficultWords();
    var word_list = this.getWordList();
    if (word_list.length != 0) {
        dale_chall_index = 0.1579 * (100.0 * difficult_words.length / word_list.length) + 0.0496 * (word_list.length / this.sentence_count);
        if (difficult_words.length / word_list.length > 0.05)
            dale_chall_index += 3.6365;

        dale_chall_index = Math.round(dale_chall_index * 10) / 10;
        percentage_difficult_words = Math.round(100 * difficult_words.length / word_list.length);
    }
    else
    {
        dale_chall_index=0;
    }
    return dale_chall_index;
};

DaleChallIndex.prototype.getWordList = function() {
    //remove numbers
    var words = this.text.replace(/[0-9]/g, '');
    //remove ' and -
    words = words.replace(/'|-/g, '');
    //lowercase
    words = words.toLowerCase();
    //create list
    return words.split(/[\s\W\n]+/);
};

DaleChallIndex.prototype.getDifficultWords = function() {
    var difficult_words = [];
    var word_list = this.getWordList();

    for (var i = 0; i < word_list.length; i++) {

        if (!(word_list[i] in simple_words)) {
            difficult_words.push(word_list[i]);
        }
        else {
            //simple
        }
    }
    return difficult_words;
};

function countWords(text, language)
{
    var words;
    if(language == 2) //non latin languages like chinese and russian - just count the spaces and be done with it
    {
        words = text.match(/\S+/g);
    }
    else
    {
        words = text.replace(/[,;.!:—\/]/g, ' ').replace(/[^a-zA-Z\d\s&:]/g, '').match(/\S+/g); //be smarter for latin languages
    }
    return (words !== null ? words.length : 0);
}

function wordCountInternational()
{
    var count = [];

    count['words'] = countWords(box.val(), ($.cookie('foreignSupport') == 1 ? 2 : 0));

    chars = box.val().match(/(?:[^\r\n]|\r(?!\n))/g);
    count['chars'] = (chars !== null ? chars.length : 0);

    chars_no_spaces = box.val().match(/\S/g);
    count['chars_no_spaces']     = (chars_no_spaces !== null ? chars_no_spaces.length : 0);

    sentences = box.val().match(/[^.!?\s][^.!?]*(?:[.!?](?!['"]?\s|$)[^.!?]*)*[.!?]?['"]?(?=\s|$)/g);
    count['sentences']           = (sentences !== null ? sentences.length : 0);

    paragraphs = box.val().match(/(\n\n?|^).*?(?=\n\n?|$)/g);
    count['paragraphs']          = (box.val() != '' ? (paragraphs !== null ? paragraphs.length : 0) : 0);

    count['avg_sentence_words'] = (box.val() != '' ? Math.ceil(count['words'] / count['sentences']) : 0);

    count['avg_sentence_chars'] = (box.val() != '' ? Math.ceil(count['chars'] / count['sentences']) : 0);

    pagesType = ($.cookie('pagesType') == 'chars' ? 'chars' : 'words');
    pagesType = ($.cookie('pagesNumber') !== undefined ? $.cookie('pagesNumber') : 200);
    if(pagesType == 'chars')
    {
        count['pages'] = count['chars'] / pagesNumber;
    }
    if(pagesType == 'words')
    {
        count['pages'] = count['words'] / pagesNumber;
    }

    d = new DaleChallIndex(box.val(), count['sentences']);

    count['reading_level'] = d.getReadingLevel();

    displayCount(count);
    displayTextBoxes(count);

    if(box.val() == '')
    {
        $('#case').attr('disabled', 'disabled');
    }
    else
    {
        $('#case').removeAttr('disabled');
    }
}

function nl2br (str, is_xhtml) {
    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+ breakTag +'$2');
}

function displayTextBoxes(count)
{
    $("#word_count").text(count['words']);
    $("#character_count").text(count['chars']);
    $("#character_count_no_spaces").text(count['chars_no_spaces']);
    $("#sentence_count").text(count['sentences']);
    $("#paragraph_count").text(count['paragraphs']);
    $("#avg_sentence_words").text(count['avg_sentence_words']);
    $("#avg_sentence_chars").text(count['avg_sentence_chars']);
    $("#pages").text(count['pages']);
    $("#reading_level").text(count['reading_level']);
}

function displayCount(count) {
    if (count['words'] == 1) {
        wordOrWords = " word";
    } else {
        wordOrWords = " words";
    }
    if (count['chars'] == 1) {
        charOrChars = " character";
    } else {
        charOrChars = " characters";
    }

    $(".counted").text(" " + count['words'] + wordOrWords + "\n" + " " + count['chars'] + charOrChars);
}

/* Keyword Density Functions */

function getTotalWeights(arr) {
    var total = 0;
    $.each(arr, function() {
        total += this;
    });
    return total;
}

//http://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
String.prototype.toTitleCase = function() {
    var i, j, str, lowers, uppers;
    str = this.replace(/([^\W_]+[^\s-]*) */g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });

    // Certain minor words should be left lowercase unless
    // they are the first or last words in the string
    lowers = ['A', 'An', 'The', 'And', 'But', 'Or', 'For', 'Nor', 'As', 'At',
        'By', 'For', 'From', 'In', 'Into', 'Near', 'Of', 'On', 'Onto', 'To', 'With'];
    for (i = 0, j = lowers.length; i < j; i++)
        str = str.replace(new RegExp('\\s' + lowers[i] + '\\s', 'g'),
            function(txt) {
                return txt.toLowerCase();
            });

    // Certain words such as initialisms or acronyms should be left uppercase
    uppers = ['Id', 'Tv'];
    for (i = 0, j = uppers.length; i < j; i++)
        str = str.replace(new RegExp('\\b' + uppers[i] + '\\b', 'g'),
            uppers[i].toUpperCase());

    return str;
};

$("#title_case").click(function(e) {
    // do whatever you want here
    if (lastFocus && box.selection() != '') {
        setTimeout(function() {
            lastFocus.focus();
            box.selection('replace', {text: box.selection().toTitleCase()});
            lastFocus = null;
        }, 10);
    }
    else
    {
        box.val(box.val().toTitleCase());
    }
    return(true);
});

String.prototype.toSentenceCase = function() {
    var str;
    var rg = /(^\w{1}|(\.|\?|!)\s*\w{1})/gi;
    str = this.toLowerCase().replace(rg, function(toReplace) {
        return toReplace.toUpperCase();
    });
    return str;
};

$("#sentence_case").click(function(e) {
    // do whatever you want here
    if (lastFocus && box.selection() != '') {
        setTimeout(function() {
            lastFocus.focus();
            box.selection('replace', {text: box.selection().toSentenceCase()});
            lastFocus = null;
        }, 10);
    }
    else
    {
        box.val(box.val().toSentenceCase());
    }
    return(true);
});

$("#lower_case").click(function(e) {
    // do whatever you want here
    if (lastFocus && box.selection() != '') {
        setTimeout(function() {
            lastFocus.focus();
            box.selection('replace', {text: box.selection().toLowerCase()});
            lastFocus = null;
        }, 10);
    }
    else
    {
        box.val(box.val().toLowerCase());
    }
    return(true);
});

var lastFocus;

$("#upper_case").click(function(e) {
    // do whatever you want here
    if (lastFocus && box.selection() != '') {
        setTimeout(function() {
            lastFocus.focus();
            box.selection('replace', {text: box.selection().toUpperCase()});
            lastFocus = null;
        }, 10);
    }
    else
    {
        box.val(box.val().toUpperCase());
    }
    return(true);
});

$("button").click(function(e) {
    // do whatever you want here
    if (lastFocus) {
        setTimeout(function() {lastFocus.focus()}, 10);
    }
    return(true);
});

box.blur(function() {
    lastFocus = this;
});

function keywordDensity() {
    var max = 1000;
    var wordsToShow = 10;
    if($.cookie('keywordDensityAmount'))
    {
        wordsToShow = $.cookie('keywordDensityAmount');
    }
    var stats = $.wordStats;
    var oldStopWords = {};
    stats.latinOnly = ($.cookie('foreignSupport') != 1);
    if($.cookie('stopWordsCommon') == 1)
    {
        stats.useStopWords = true;
    }
    else if($.cookie('stopWordsCommon') == 0)
    {
        stats.useStopWords = false;
    }
    //console.log(stats.stopWords);
    stats.computeTopWords(max, $('#box'));
    totalWeights = getTotalWeights(stats.topWeights);
    density_list = $("#collapseTwo");
    density_list.empty();
    var text = '';
    var percentage;
    for (i = 0; i < stats.topWords.length; i++) {
        if (i == wordsToShow) {
            break;
        }
        percentage = (100 * (stats.topWeights[i] / totalWeights)).toFixed(0);
        density_list.append('<a class="list-group-item" href="#"><span class="badge"> ' + stats.topWeights[i] + ' (' + percentage + '%)</span><span class="word">' + stats.topWords[i] + '</span></a>');
    }
    stats.clear();
}

$(function() {

    box.keypress(wordCountInternational).blur(wordCountInternational).focus(wordCountInternational).change(wordCountInternational).keyup(wordCountInternational).keydown(wordCountInternational).load(wordCountInternational);
    box.keypress(keywordDensity).blur(keywordDensity).focus(keywordDensity).change(keywordDensity).keyup(keywordDensity).keydown(keywordDensity).load(keywordDensity);

    /* Word and Character count Functions */
    box.bind('paste', function(e) {
        var el = $(this);
        setTimeout(function() {
            var text = $(el).val();
            keywordDensity();
        }, 4);
    });

    function getQueryParams(qs) {
        qs = qs.split("+").join(" ");
        var params = {},
            tokens,
            re = /[?&]?([^=]+)=([^&]*)/g;

        while (tokens = re.exec(qs)) {
            params[decodeURIComponent(tokens[1])]
                = decodeURIComponent(tokens[2]);
        }

        return params;
    }

    var $_GET = getQueryParams(document.location.search);

    /*
     $("#wordai_button").mouseover(function() {
     $(this).attr("src", "wordai2.png");
     });

     $("#wordai_button").mouseout(function() {
     $(this).attr("src", "wordai.png");
     });
     */

    body = $("body");

    body.on('click', '#collapseTwo a', function(e) {
        e.preventDefault();
        if(!$(this).hasClass('active'))
        {
            box_readonly = $('#box_readonly');
            box_readonly.show();
            box_readonly.html(nl2br($("#box").val()));
            box_readonly.highlight($(this).find('.word').text(), { wordsOnly: true });
            box_readonly.height($('#box').height()+23);
            $('#form').hide();
            $(this).siblings().removeClass('active');
            $(this).addClass('active');
            $('#case').addClass('disabled');
            $('#check-grammar-spelling').removeClass('active');
        }
        else
        {
            $('#box_readonly').hide();
            $('#form').show();
            $('#collapseTwo').find('a').removeClass('active');
            $('#case').removeClass('disabled');
        }
    });

    body.on('click', '#box_readonly', function(e) {
        if(!$(e.target).hasClass('hiddenSpellError'))
        {
            $('#box_readonly').hide();
            $('#box').val($('#box_readonly').text());
            $('#form').show();
            $('#collapseTwo').find('a').removeClass('active');
            $('#check-grammar-spelling').removeClass('active');
            $('#case').removeClass('disabled');
        }
    });

    $( '#options' ).garlic();

    $( '#form' ).garlic( {
        onRetrieve: function ( elem, retrievedValue ) {
            keywordDensity();
            wordCountInternational();
        }
    } );

    $('#hide_job_postings').on('click', function () {
        $.cookie('hide_job_posting', '1', { expires: 15 });
        $('#job_postings_box').hide();
    });

    blog_entry_alert = $('#blog_entry_alert');
    blog_entry_alert.bind('closed.bs.alert', function () {
        $.cookie('blog_entry', 'hide', { expires: 7 });
    });

    if($.cookie('blog_entry') != 'hide')
    {
        blog_entry_alert.show();
    }

    new_version_alert = $('#new_version_alert');
    new_version_alert.bind('closed.bs.alert', function () {
        $.cookie('new_version', 'hide', { expires: 15 });
    });

    if($.cookie('new_version') != 'hide')
    {
        new_version_alert.show();
    }

    /*
    $('#saveWordsCheckbox').click(function() {
        if($(this).prop('checked'))
        {
            checked = 1;
        }
        else
        {
            checked = 0;
            $( '#form' ).garlic( 'destroy' );
        }
        $.cookie('saveWordsChecked', checked, { expires: 365 });
    });
    */

    $('#stopWordsCommon').click(function() {
        if($(this).prop('checked'))
        {
            checked = 1;
        }
        else
        {
            checked = 0;
        }
        $.cookie('stopWordsCommon', checked, { expires: 365 });
        keywordDensity();
        wordCountInternational();
    });

    $('#foreignSupport').click(function() {
        if($(this).prop('checked'))
        {
            checked = 1;
        }
        else
        {
            checked = 0;
        }
        $.cookie('foreignSupport', checked, { expires: 365 });
        keywordDensity();
        wordCountInternational();
    });

    $('#keywordDensityAmount').on('change', function() {
        $.cookie('keywordDensityAmount', $(this).val(), { expires: 365 });
        keywordDensity();
        wordCountInternational();
    });

    $('.link-popover').popover();

    $('#diffLink').click(function() {
        $.ajax({
            type: "POST",
            url: "rbc.php",
            data: { text: box.val() },
            dataType: "json"
        })
            .done(function( msg ) {
                $('.original').html(box.val());
                $('.changed').html(msg.text);
                $("#wrapper tr").prettyTextDiff({
                    cleanup: true
                });
                box.val(msg.text);
            });
    });

    if(h = $.cookie('box_height'))
    {
        box.height(h);
    }

    $('#box:not(.processed)').TextAreaResizer({
        onResize: function (e, height) {
            $.cookie('box_height', height + 15, { expires: 365 });
        }
    });

    $('.collapse').collapse('show');

    $('#clear').on('click', function() {
        original = box.val();
        box.val('');
    });

    $('#undo').on('click', function() {
        if(document.execCommand("undo", false, null) === false && original !== undefined)
        {
            box.val(original);
        }
    });

    $('#redo').on('click', function() {
        document.execCommand("redo", false, null);
    });

    $('#check-grammar-spelling').on('click', function (e) {
        e.preventDefault();

        box_readonly = $('#box_readonly');
        if(!$(this).hasClass('active'))
        {
            $('#collapseTwo a').siblings().removeClass('active');
            box_readonly.show();
            box_readonly.html(nl2br(box.val()));
            box_readonly.height(box.height() + 23);
            $('#form').hide();
            $(this).addClass('active');

            AtD.rpc_css = 'proxycss.php?data=';
            AtD.checkCrossAJAX('box_readonly',
                {
                    success : function(errorCount)
                    {
                        if (errorCount == 0)
                        {
                            alert("No writing errors were found");
                        }
                    },
                    error : function(reason)
                    {
                        alert(reason);
                    }
                });

            $('#case').addClass('disabled');
        }
        else
        {
            box_readonly.hide();
            $('#box').val($('#box_readonly').text());
            $('#form').show();
            $(this).removeClass('active');
            $('#case').removeClass('disabled');
        }
    });

    box.focus();

    //analytics
    var _gaq = _gaq || [];
    _gaq.push(['_setAccount', 'UA-145467-20']);
    _gaq.push(['_trackPageview']);

    (function() {
        var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
        ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
    })();

    //gplus
    (function() {
        var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
        po.src = 'https://apis.google.com/js/platform.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
    })();

    //facebook
    (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = "//connect.facebook.net/en_US/all.js#xfbml=1&appId=601160713280345";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

    //twitter
    !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');

});

simple_words={"":1,"a":1,"able":1,"aboard":1,"about":1,"above":1,"absent":1,"accept":1,"accident":1,"account":1,"ache":1,"aching":1,"acorn":1,"acre":1,"across":1,"act":1,"acts":1,"add":1,"address":1,"admire":1,"adventure":1,"afar":1,"afraid":1,"after":1,"afternoon":1,"afterward":1,"afterwards":1,"again":1,"against":1,"age":1,"aged":1,"ago":1,"agree":1,"ah":1,"ahead":1,"aid":1,"aim":1,"air":1,"airfield":1,"airplane":1,"airport":1,"airship":1,"airy":1,"alarm":1,"alike":1,"alive":1,"all":1,"alley":1,"alligator":1,"allow":1,"almost":1,"alone":1,"along":1,"aloud":1,"already":1,"also":1,"always":1,"am":1,"america":1,"american":1,"among":1,"amount":1,"an":1,"and":1,"angel":1,"anger":1,"angry":1,"animal":1,"another":1,"answer":1,"ant":1,"any":1,"anybody":1,"anyhow":1,"anyone":1,"anything":1,"anyway":1,"anywhere":1,"apart":1,"apartment":1,"ape":1,"apiece":1,"appear":1,"apple":1,"april":1,"apron":1,"are":1,"aren't":1,"arent":1,"arise":1,"arithmetic":1,"arm":1,"armful":1,"army":1,"arose":1,"around":1,"arrange":1,"arrive":1,"arrived":1,"arrow":1,"art":1,"artist":1,"as":1,"ash":1,"ashes":1,"aside":1,"ask":1,"asleep":1,"at":1,"ate":1,"attack":1,"attend":1,"attention":1,"august":1,"aunt":1,"author":1,"auto":1,"automobile":1,"autumn":1,"avenue":1,"awake":1,"awaken":1,"away":1,"awful":1,"awfully":1,"awhile":1,"ax":1,"axe":1,"baa":1,"babe":1,"babies":1,"back":1,"background":1,"backward":1,"backwards":1,"bacon":1,"bad":1,"badge":1,"badly":1,"bag":1,"bake":1,"baker":1,"bakery":1,"baking":1,"ball":1,"balloon":1,"banana":1,"band":1,"bandage":1,"bang":1,"banjo":1,"bank":1,"banker":1,"bar":1,"barber":1,"bare":1,"barefoot":1,"barely":1,"bark":1,"barn":1,"barrel":1,"base":1,"baseball":1,"basement":1,"basket":1,"bat":1,"batch":1,"bath":1,"bathe":1,"bathing":1,"bathroom":1,"bathtub":1,"battle":1,"battleship":1,"bay":1,"be":1,"beach":1,"bead":1,"beam":1,"bean":1,"bear":1,"beard":1,"beast":1,"beat":1,"beating":1,"beautiful":1,"beautify":1,"beauty":1,"became":1,"because":1,"become":1,"becoming":1,"bed":1,"bedbug":1,"bedroom":1,"bedspread":1,"bedtime":1,"bee":1,"beech":1,"beef":1,"beefsteak":1,"beehive":1,"been":1,"beer":1,"beet":1,"before":1,"beg":1,"began":1,"beggar":1,"begged":1,"begin":1,"beginning":1,"begun":1,"behave":1,"behind":1,"being":1,"believe":1,"bell":1,"belong":1,"below":1,"belt":1,"bench":1,"bend":1,"beneath":1,"bent":1,"berries":1,"berry":1,"beside":1,"besides":1,"best":1,"bet":1,"better":1,"between":1,"bib":1,"bible":1,"bicycle":1,"bid":1,"big":1,"bigger":1,"bill":1,"billboard":1,"bin":1,"bind":1,"bird":1,"birth":1,"birthday":1,"biscuit":1,"bit":1,"bite":1,"biting":1,"bitter":1,"black":1,"blackberry":1,"blackbird":1,"blackboard":1,"blackness":1,"blacksmith":1,"blame":1,"blank":1,"blanket":1,"blast":1,"blaze":1,"bleed":1,"bless":1,"blessing":1,"blew":1,"blind":1,"blindfold":1,"blinds":1,"block":1,"blood":1,"bloom":1,"blossom":1,"blot":1,"blow":1,"blue":1,"blueberry":1,"bluebird":1,"blush":1,"board":1,"boast":1,"boat":1,"bob":1,"bobwhite":1,"bodies":1,"body":1,"boil":1,"boiler":1,"bold":1,"bone":1,"bonnet":1,"boo":1,"book":1,"bookcase":1,"bookkeeper":1,"boom":1,"boot":1,"born":1,"borrow":1,"boss":1,"both":1,"bother":1,"bottle":1,"bottom":1,"bought":1,"bounce":1,"bow":1,"bow-wow":1,"bowl":1,"bowwow":1,"box":1,"boxcar":1,"boxer":1,"boxes":1,"boy":1,"boyhood":1,"bracelet":1,"brain":1,"brake":1,"bran":1,"branch":1,"brass":1,"brave":1,"bread":1,"break":1,"breakfast":1,"breast":1,"breath":1,"breathe":1,"breeze":1,"brick":1,"bride":1,"bridge":1,"bright":1,"brightness":1,"bring":1,"broad":1,"broadcast":1,"broke":1,"broken":1,"brook":1,"broom":1,"brother":1,"brought":1,"brown":1,"brush":1,"bubble":1,"bucket":1,"buckle":1,"bud":1,"buffalo":1,"bug":1,"buggy":1,"build":1,"building":1,"built":1,"bulb":1,"bull":1,"bullet":1,"bum":1,"bumblebee":1,"bump":1,"bun":1,"bunch":1,"bundle":1,"bunny":1,"burn":1,"burst":1,"bury":1,"bus":1,"bush":1,"bushel":1,"business":1,"busy":1,"but":1,"butcher":1,"butt":1,"butter":1,"buttercup":1,"butterfly":1,"buttermilk":1,"butterscotch":1,"button":1,"buttonhole":1,"buy":1,"buzz":1,"by":1,"bye":1,"cab":1,"cabbage":1,"cabin":1,"cabinet":1,"cackle":1,"cage":1,"cake":1,"calendar":1,"calf":1,"call":1,"caller":1,"calling":1,"came":1,"camel":1,"camp":1,"campfire":1,"can":1,"can't":1,"canal":1,"canary":1,"candle":1,"candlestick":1,"candy":1,"cane":1,"cannon":1,"cannot":1,"canoe":1,"cant":1,"canyon":1,"cap":1,"cape":1,"capital":1,"captain":1,"car":1,"card":1,"cardboard":1,"care":1,"careful":1,"careless":1,"carelessness":1,"carload":1,"carpenter":1,"carpet":1,"carriage":1,"carrot":1,"carry":1,"cart":1,"carve":1,"case":1,"cash":1,"cashier":1,"castle":1,"cat":1,"catbird":1,"catch":1,"catcher":1,"caterpillar":1,"catfish":1,"catsup":1,"cattle":1,"caught":1,"cause":1,"cave":1,"ceiling":1,"cell":1,"cellar":1,"cent":1,"center":1,"cereal":1,"certain":1,"certainly":1,"chain":1,"chair":1,"chalk":1,"champion":1,"chance":1,"change":1,"chap":1,"charge":1,"charm":1,"chart":1,"chase":1,"chatter":1,"cheap":1,"cheat":1,"check":1,"checkers":1,"cheek":1,"cheer":1,"cheese":1,"cherry":1,"chest":1,"chew":1,"chick":1,"chicken":1,"chief":1,"child":1,"childhood":1,"children":1,"chill":1,"chilly":1,"chimney":1,"chin":1,"china":1,"chip":1,"chipmunk":1,"chocolate":1,"choice":1,"choose":1,"chop":1,"chorus":1,"chose":1,"chosen":1,"christen":1,"christmas":1,"church":1,"churn":1,"cigarette":1,"circle":1,"circus":1,"citizen":1,"city":1,"clang":1,"clap":1,"class":1,"classmate":1,"classroom":1,"claw":1,"clay":1,"clean":1,"cleaner":1,"clear":1,"clerk":1,"clever":1,"click":1,"cliff":1,"climb":1,"clip":1,"cloak":1,"clock":1,"close":1,"closet":1,"cloth":1,"clothes":1,"clothing":1,"cloud":1,"cloudy":1,"clover":1,"clown":1,"club":1,"cluck":1,"clump":1,"coach":1,"coal":1,"coast":1,"coat":1,"cob":1,"cobbler":1,"cocoa":1,"coconut":1,"cocoon":1,"cod":1,"codfish":1,"coffee":1,"coffeepot":1,"coin":1,"cold":1,"collar":1,"college":1,"color":1,"colored":1,"colt":1,"column":1,"comb":1,"come":1,"comfort":1,"comic":1,"coming":1,"company":1,"compare":1,"conductor":1,"cone":1,"connect":1,"coo":1,"cook":1,"cooked":1,"cookie":1,"cookies":1,"cooking":1,"cool":1,"cooler":1,"coop":1,"copper":1,"copy":1,"cord":1,"cork":1,"corn":1,"corner":1,"correct":1,"cost":1,"cot":1,"cottage":1,"cotton":1,"couch":1,"cough":1,"could":1,"couldn't":1,"couldnt":1,"count":1,"counter":1,"country":1,"county":1,"course":1,"court":1,"cousin":1,"cover":1,"cow":1,"coward":1,"cowardly":1,"cowboy":1,"cozy":1,"crab":1,"crack":1,"cracker":1,"cradle":1,"cramps":1,"cranberry":1,"crank":1,"cranky":1,"crash":1,"crawl":1,"crazy":1,"cream":1,"creamy":1,"creek":1,"creep":1,"crept":1,"cried":1,"cries":1,"croak":1,"crook":1,"crooked":1,"crop":1,"cross":1,"cross-eyed":1,"crosseyed":1,"crossing":1,"crow":1,"crowd":1,"crowded":1,"crown":1,"cruel":1,"crumb":1,"crumble":1,"crush":1,"crust":1,"cry":1,"cub":1,"cuff":1,"cuff":1,"cup":1,"cup":1,"cupboard":1,"cupful":1,"cure":1,"curl":1,"curly":1,"curtain":1,"curve":1,"cushion":1,"custard":1,"customer":1,"cut":1,"cute":1,"cutting":1,"dab":1,"dad":1,"daddy":1,"daily":1,"dairy":1,"daisy":1,"dam":1,"damage":1,"dame":1,"damp":1,"dance":1,"dancer":1,"dancing":1,"dandy":1,"danger":1,"dangerous":1,"dare":1,"dark":1,"darkness":1,"darling":1,"darn":1,"dart":1,"dash":1,"date":1,"daughter":1,"dawn":1,"day":1,"daybreak":1,"daytime":1,"dead":1,"deaf":1,"deal":1,"dear":1,"death":1,"december":1,"decide":1,"deck":1,"deed":1,"deep":1,"deer":1,"defeat":1,"defend":1,"defense":1,"delight":1,"den":1,"dentist":1,"depend":1,"deposit":1,"describe":1,"desert":1,"deserve":1,"desire":1,"desk":1,"destroy":1,"devil":1,"dew":1,"diamond":1,"did":1,"didn't":1,"didnt":1,"die":1,"died":1,"dies":1,"difference":1,"different":1,"dig":1,"dim":1,"dime":1,"dine":1,"ding-dong":1,"dingdong":1,"dinner":1,"dip":1,"direct":1,"direction":1,"dirt":1,"dirty":1,"discover":1,"dish":1,"dislike":1,"dismiss":1,"ditch":1,"dive":1,"diver":1,"divide":1,"do":1,"dock":1,"doctor":1,"does":1,"doesn't":1,"doesnt":1,"dog":1,"doll":1,"dollar":1,"dolly":1,"don't":1,"done":1,"donkey":1,"dont":1,"door":1,"doorbell":1,"doorknob":1,"doorstep":1,"dope":1,"dot":1,"double":1,"dough":1,"dove":1,"down":1,"downstairs":1,"downtown":1,"dozen":1,"drag":1,"drain":1,"drank":1,"draw":1,"draw":1,"drawer":1,"drawing":1,"dream":1,"dress":1,"dresser":1,"dressmaker":1,"drew":1,"dried":1,"drift":1,"drill":1,"drink":1,"drip":1,"drive":1,"driven":1,"driver":1,"drop":1,"drove":1,"drown":1,"drowsy":1,"drub":1,"drum":1,"drunk":1,"dry":1,"duck":1,"due":1,"dug":1,"dull":1,"dumb":1,"dump":1,"during":1,"dust":1,"dusty":1,"duty":1,"dwarf":1,"dwell":1,"dwelt":1,"dying":1,"each":1,"eager":1,"eagle":1,"ear":1,"early":1,"earn":1,"earth":1,"east":1,"eastern":1,"easy":1,"eat":1,"eaten":1,"edge":1,"egg":1,"eh":1,"eight":1,"eighteen":1,"eighth":1,"eighty":1,"either":1,"elbow":1,"elder":1,"eldest":1,"electric":1,"electricity":1,"elephant":1,"eleven":1,"elf":1,"elm":1,"else":1,"elsewhere":1,"empty":1,"end":1,"ending":1,"enemy":1,"engine":1,"engineer":1,"english":1,"enjoy":1,"enough":1,"enter":1,"envelope":1,"equal":1,"erase":1,"eraser":1,"errand":1,"escape":1,"eve":1,"even":1,"evening":1,"ever":1,"every":1,"everybody":1,"everyday":1,"everyone":1,"everything":1,"everywhere":1,"evil":1,"exact":1,"except":1,"exchange":1,"excited":1,"exciting":1,"excuse":1,"exit":1,"expect":1,"explain":1,"extra":1,"eye":1,"eyebrow":1,"fable":1,"face":1,"facing":1,"fact":1,"factory":1,"fail":1,"faint":1,"fair":1,"fairy":1,"faith":1,"fake":1,"fall":1,"false":1,"family":1,"fan":1,"fancy":1,"far":1,"far-off":1,"faraway":1,"fare":1,"farm":1,"farmer":1,"farming":1,"faroff":1,"farther":1,"fashion":1,"fast":1,"fasten":1,"fat":1,"father":1,"fault":1,"favor":1,"favorite":1,"fear":1,"feast":1,"feather":1,"february":1,"fed":1,"feed":1,"feel":1,"feet":1,"fell":1,"fellow":1,"felt":1,"fence":1,"fever":1,"few":1,"fib":1,"fiddle":1,"field":1,"fife":1,"fifteen":1,"fifth":1,"fifty":1,"fig":1,"fight":1,"figure":1,"file":1,"fill":1,"film":1,"finally":1,"find":1,"fine":1,"finger":1,"finish":1,"fire":1,"firearm":1,"firecracker":1,"fireplace":1,"fireworks":1,"firing":1,"first":1,"fish":1,"fisherman":1,"fist":1,"fit":1,"fits":1,"five":1,"fix":1,"flag":1,"flake":1,"flame":1,"flap":1,"flash":1,"flashlight":1,"flat":1,"flea":1,"flesh":1,"flew":1,"flies":1,"flight":1,"flip":1,"flip-flop":1,"flipflop":1,"float":1,"flock":1,"flood":1,"floor":1,"flop":1,"flour":1,"flow":1,"flower":1,"flowery":1,"flutter":1,"fly":1,"foam":1,"fog":1,"foggy":1,"fold":1,"folks":1,"follow":1,"following":1,"fond":1,"food":1,"fool":1,"foolish":1,"foot":1,"football":1,"footprint":1,"for":1,"forehead":1,"forest":1,"forget":1,"forgive":1,"forgot":1,"forgotten":1,"fork":1,"form":1,"fort":1,"forth":1,"fortune":1,"forty":1,"forward":1,"fought":1,"found":1,"fountain":1,"four":1,"fourteen":1,"fourth":1,"fox":1,"frame":1,"free":1,"freedom":1,"freeze":1,"freight":1,"french":1,"fresh":1,"fret":1,"friday":1,"fried":1,"friend":1,"friendly":1,"friendship":1,"frighten":1,"frog":1,"from":1,"front":1,"frost":1,"frown":1,"froze":1,"fruit":1,"fry":1,"fudge":1,"fuel":1,"full":1,"fully":1,"fun":1,"funny":1,"fur":1,"furniture":1,"further":1,"fuzzy":1,"gain":1,"gallon":1,"gallop":1,"game":1,"gang":1,"garage":1,"garbage":1,"garden":1,"gas":1,"gasoline":1,"gate":1,"gather":1,"gave":1,"gay":1,"gear":1,"geese":1,"general":1,"gentle":1,"gentleman":1,"gentlemen":1,"geography":1,"get":1,"getting":1,"giant":1,"gift":1,"gingerbread":1,"girl":1,"give":1,"given":1,"giving":1,"glad":1,"gladly":1,"glance":1,"glass":1,"glasses":1,"gleam":1,"glide":1,"glory":1,"glove":1,"glow":1,"glue":1,"go":1,"goal":1,"goat":1,"gobble":1,"god":1,"god":1,"godmother":1,"goes":1,"going":1,"gold":1,"golden":1,"goldfish":1,"golf":1,"gone":1,"good":1,"good-by":1,"good-bye":1,"good-looking":1,"goodby":1,"goodbye":1,"goodbye":1,"goodbye":1,"goodlooking":1,"goodness":1,"goods":1,"goody":1,"goose":1,"gooseberry":1,"got":1,"govern":1,"government":1,"gown":1,"grab":1,"gracious":1,"grade":1,"grain":1,"grand":1,"grandchild":1,"grandchildren":1,"granddaughter":1,"grandfather":1,"grandma":1,"grandmother":1,"grandpa":1,"grandson":1,"grandstand":1,"grape":1,"grapefruit":1,"grapes":1,"grass":1,"grasshopper":1,"grateful":1,"grave":1,"gravel":1,"graveyard":1,"gravy":1,"gray":1,"graze":1,"grease":1,"great":1,"green":1,"greet":1,"grew":1,"grind":1,"groan":1,"grocery":1,"ground":1,"group":1,"grove":1,"grow":1,"guard":1,"guess":1,"guest":1,"guide":1,"gulf":1,"gum":1,"gun":1,"gunpowder":1,"guy":1,"ha":1,"habit":1,"had":1,"hadn't":1,"hadnt":1,"hail":1,"hair":1,"haircut":1,"hairpin":1,"half":1,"hall":1,"halt":1,"ham":1,"hammer":1,"hand":1,"handful":1,"handkerchief":1,"handle":1,"handwriting":1,"hang":1,"happen":1,"happily":1,"happiness":1,"happy":1,"harbor":1,"hard":1,"hardly":1,"hardship":1,"hardware":1,"hare":1,"hark":1,"harm":1,"harness":1,"harp":1,"harvest":1,"has":1,"hasn't":1,"hasnt":1,"haste":1,"hasten":1,"hasty":1,"hat":1,"hatch":1,"hatchet":1,"hate":1,"haul":1,"have":1,"haven't":1,"havent":1,"having":1,"hawk":1,"hay":1,"hayfield":1,"haystack":1,"he":1,"he'd":1,"he'll":1,"he's":1,"head":1,"headache":1,"heal":1,"health":1,"healthy":1,"heap":1,"hear":1,"heard":1,"hearing":1,"heart":1,"heat":1,"heater":1,"heaven":1,"heavy":1,"hed":1,"heel":1,"height":1,"held":1,"hell":1,"hell":1,"hello":1,"helmet":1,"help":1,"helper":1,"helpful":1,"hem":1,"hen":1,"henhouse":1,"her":1,"herd":1,"here":1,"here's":1,"heres":1,"hero":1,"hers":1,"herself":1,"hes":1,"hey":1,"hickory":1,"hid":1,"hidden":1,"hide":1,"high":1,"highway":1,"hill":1,"hillside":1,"hilltop":1,"hilly":1,"him":1,"himself":1,"hind":1,"hint":1,"hip":1,"hire":1,"his":1,"hiss":1,"history":1,"hit":1,"hitch":1,"hive":1,"ho":1,"hoe":1,"hog":1,"hold":1,"holder":1,"hole":1,"holiday":1,"hollow":1,"holy":1,"home":1,"homely":1,"homesick":1,"honest":1,"honey":1,"honeybee":1,"honeymoon":1,"honk":1,"honor":1,"hood":1,"hoof":1,"hook":1,"hoop":1,"hop":1,"hope":1,"hopeful":1,"hopeless":1,"horn":1,"horse":1,"horseback":1,"horseshoe":1,"hose":1,"hospital":1,"host":1,"hot":1,"hotel":1,"hound":1,"hour":1,"house":1,"housetop":1,"housewife":1,"housework":1,"how":1,"however":1,"howl":1,"hug":1,"huge":1,"hum":1,"humble":1,"hump":1,"hundred":1,"hung":1,"hunger":1,"hungry":1,"hunk":1,"hunt":1,"hunter":1,"hurrah":1,"hurried":1,"hurry":1,"hurt":1,"husband":1,"hush":1,"hut":1,"hymn":1,"i":1,"i'd":1,"i'll":1,"i'm":1,"i've":1,"ice":1,"icy":1,"id":1,"idea":1,"ideal":1,"if":1,"ill":1,"ill":1,"im":1,"important":1,"impossible":1,"improve":1,"in":1,"inch":1,"inches":1,"income":1,"indeed":1,"indian":1,"indoors":1,"ink":1,"inn":1,"insect":1,"inside":1,"instant":1,"instead":1,"insult":1,"intend":1,"interested":1,"interesting":1,"into":1,"invite":1,"iron":1,"is":1,"island":1,"isn't":1,"isnt":1,"it":1,"it's":1,"its":1,"its":1,"itself":1,"ive":1,"ivory":1,"ivy":1,"jacket":1,"jacks":1,"jail":1,"jam":1,"january":1,"jar":1,"jaw":1,"jay":1,"jelly":1,"jellyfish":1,"jerk":1,"jig":1,"job":1,"jockey":1,"join":1,"joke":1,"joking":1,"jolly":1,"journey":1,"joy":1,"joyful":1,"joyous":1,"judge":1,"jug":1,"juice":1,"juicy":1,"july":1,"jump":1,"june":1,"junior":1,"junk":1,"just":1,"keen":1,"keep":1,"kept":1,"kettle":1,"key":1,"kick":1,"kid":1,"kill":1,"killed":1,"kind":1,"kindly":1,"kindness":1,"king":1,"kingdom":1,"kiss":1,"kitchen":1,"kite":1,"kitten":1,"kitty":1,"knee":1,"kneel":1,"knew":1,"knife":1,"knit":1,"knives":1,"knob":1,"knock":1,"knot":1,"know":1,"known":1,"lace":1,"lad":1,"ladder":1,"ladies":1,"lady":1,"laid":1,"lake":1,"lamb":1,"lame":1,"lamp":1,"land":1,"lane":1,"language":1,"lantern":1,"lap":1,"lard":1,"large":1,"lash":1,"lass":1,"last":1,"late":1,"laugh":1,"laundry":1,"law":1,"lawn":1,"lawyer":1,"lay":1,"lazy":1,"lead":1,"leader":1,"leaf":1,"leak":1,"lean":1,"leap":1,"learn":1,"learned":1,"least":1,"leather":1,"leave":1,"leaving":1,"led":1,"left":1,"leg":1,"lemon":1,"lemonade":1,"lend":1,"length":1,"less":1,"lesson":1,"let":1,"let's":1,"lets":1,"letter":1,"letting":1,"lettuce":1,"level":1,"liberty":1,"library":1,"lice":1,"lick":1,"lid":1,"lie":1,"life":1,"lift":1,"light":1,"lightness":1,"lightning":1,"like":1,"likely":1,"liking":1,"lily":1,"limb":1,"lime":1,"limp":1,"line":1,"linen":1,"lion":1,"lip":1,"list":1,"listen":1,"lit":1,"little":1,"live":1,"lively":1,"liver":1,"lives":1,"living":1,"lizard":1,"load":1,"loaf":1,"loan":1,"loaves":1,"lock":1,"locomotive":1,"log":1,"lone":1,"lonely":1,"lonesome":1,"long":1,"look":1,"lookout":1,"loop":1,"loose":1,"lord":1,"lose":1,"loser":1,"loss":1,"lost":1,"lot":1,"loud":1,"love":1,"lovely":1,"lover":1,"low":1,"luck":1,"lucky":1,"lumber":1,"lump":1,"lunch":1,"lying":1,"ma":1,"machine":1,"machinery":1,"mad":1,"made":1,"magazine":1,"magic":1,"maid":1,"mail":1,"mailbox":1,"mailman":1,"major":1,"make":1,"making":1,"male":1,"mama":1,"mamma":1,"man":1,"manager":1,"mane":1,"manger":1,"many":1,"map":1,"maple":1,"marble":1,"march":1,"march":1,"mare":1,"mark":1,"market":1,"marriage":1,"married":1,"marry":1,"mask":1,"mast":1,"master":1,"mat":1,"match":1,"matter":1,"mattress":1,"may":1,"may":1,"maybe":1,"mayor":1,"maypole":1,"me":1,"meadow":1,"meal":1,"mean":1,"means":1,"meant":1,"measure":1,"meat":1,"medicine":1,"meet":1,"meeting":1,"melt":1,"member":1,"men":1,"mend":1,"meow":1,"merry":1,"mess":1,"message":1,"met":1,"metal":1,"mew":1,"mice":1,"middle":1,"midnight":1,"might":1,"mighty":1,"mile":1,"miler":1,"milk":1,"milkman":1,"mill":1,"million":1,"mind":1,"mine":1,"miner":1,"mint":1,"minute":1,"mirror":1,"mischief":1,"miss":1,"miss":1,"misspell":1,"mistake":1,"misty":1,"mitt":1,"mitten":1,"mix":1,"moment":1,"monday":1,"money":1,"monkey":1,"month":1,"moo":1,"moon":1,"moonlight":1,"moose":1,"mop":1,"more":1,"morning":1,"morrow":1,"moss":1,"most":1,"mostly":1,"mother":1,"motor":1,"mount":1,"mountain":1,"mouse":1,"mouth":1,"move":1,"movie":1,"movies":1,"moving":1,"mow":1,"mr":1,"mr.":1,"mrs":1,"mrs.":1,"much":1,"mud":1,"muddy":1,"mug":1,"mule":1,"multiply":1,"murder":1,"music":1,"must":1,"my":1,"myself":1,"nail":1,"name":1,"nap":1,"napkin":1,"narrow":1,"nasty":1,"naughty":1,"navy":1,"near":1,"nearby":1,"nearly":1,"neat":1,"neck":1,"necktie":1,"need":1,"needle":1,"needn't":1,"neednt":1,"negro":1,"neighbor":1,"neighborhood":1,"neither":1,"nerve":1,"nest":1,"net":1,"never":1,"nevermore":1,"new":1,"news":1,"newspaper":1,"next":1,"nibble":1,"nice":1,"nickel":1,"night":1,"nightgown":1,"nine":1,"nineteen":1,"ninety":1,"no":1,"nobody":1,"nod":1,"noise":1,"noisy":1,"none":1,"noon":1,"nor":1,"north":1,"northern":1,"nose":1,"not":1,"note":1,"nothing":1,"notice":1,"november":1,"now":1,"nowhere":1,"number":1,"nurse":1,"nut":1,"o'clock":1,"oak":1,"oar":1,"oatmeal":1,"oats":1,"obey":1,"ocean":1,"oclock":1,"october":1,"odd":1,"of":1,"off":1,"offer":1,"office":1,"officer":1,"often":1,"oh":1,"oil":1,"old":1,"old-fashioned":1,"oldfashioned":1,"on":1,"once":1,"one":1,"onion":1,"only":1,"onward":1,"open":1,"or":1,"orange":1,"orchard":1,"order":1,"ore":1,"organ":1,"other":1,"otherwise":1,"ouch":1,"ought":1,"our":1,"ours":1,"ourselves":1,"out":1,"outdoors":1,"outfit":1,"outlaw":1,"outline":1,"outside":1,"outward":1,"oven":1,"over":1,"overalls":1,"overcoat":1,"overeat":1,"overhead":1,"overhear":1,"overnight":1,"overturn":1,"owe":1,"owing":1,"owl":1,"own":1,"owner":1,"ox":1,"pa":1,"pace":1,"pack":1,"package":1,"pad":1,"page":1,"paid":1,"pail":1,"pain":1,"painful":1,"paint":1,"painter":1,"painting":1,"pair":1,"pal":1,"palace":1,"pale":1,"pan":1,"pancake":1,"pane":1,"pansy":1,"pants":1,"papa":1,"paper":1,"parade":1,"pardon":1,"parent":1,"park":1,"part":1,"partly":1,"partner":1,"party":1,"pass":1,"passenger":1,"past":1,"paste":1,"pasture":1,"pat":1,"patch":1,"path":1,"patter":1,"pave":1,"pavement":1,"paw":1,"pay":1,"payment":1,"pea":1,"peace":1,"peaceful":1,"peach":1,"peaches":1,"peak":1,"peanut":1,"pear":1,"pearl":1,"peas":1,"peck":1,"peek":1,"peel":1,"peep":1,"peg":1,"pen":1,"pencil":1,"penny":1,"people":1,"pepper":1,"peppermint":1,"perfume":1,"perhaps":1,"person":1,"pet":1,"phone":1,"piano":1,"pick":1,"pickle":1,"picnic":1,"picture":1,"pie":1,"piece":1,"pig":1,"pigeon":1,"piggy":1,"pile":1,"pill":1,"pillow":1,"pin":1,"pine":1,"pineapple":1,"pink":1,"pint":1,"pipe":1,"pistol":1,"pit":1,"pitch":1,"pitcher":1,"pity":1,"place":1,"plain":1,"plan":1,"plane":1,"plant":1,"plate":1,"platform":1,"platter":1,"play":1,"player":1,"playground":1,"playhouse":1,"playmate":1,"plaything":1,"pleasant":1,"please":1,"pleasure":1,"plenty":1,"plow":1,"plug":1,"plum":1,"pocket":1,"pocketbook":1,"poem":1,"point":1,"poison":1,"poke":1,"pole":1,"police":1,"policeman":1,"polish":1,"polite":1,"pond":1,"ponies":1,"pony":1,"pool":1,"poor":1,"pop":1,"popcorn":1,"popped":1,"porch":1,"pork":1,"possible":1,"post":1,"postage":1,"postman":1,"pot":1,"potato":1,"potatoes":1,"pound":1,"pour":1,"powder":1,"power":1,"powerful":1,"praise":1,"pray":1,"prayer":1,"prepare":1,"present":1,"pretty":1,"price":1,"prick":1,"prince":1,"princess":1,"print":1,"prison":1,"prize":1,"promise":1,"proper":1,"protect":1,"proud":1,"prove":1,"prune":1,"public":1,"puddle":1,"puff":1,"pull":1,"pump":1,"pumpkin":1,"punch":1,"punish":1,"pup":1,"pupil":1,"puppy":1,"pure":1,"purple":1,"purse":1,"push":1,"puss":1,"pussy":1,"pussycat":1,"put":1,"putting":1,"puzzle":1,"quack":1,"quart":1,"quarter":1,"queen":1,"queer":1,"question":1,"quick":1,"quickly":1,"quiet":1,"quilt":1,"quit":1,"quite":1,"rabbit":1,"race":1,"rack":1,"radio":1,"radish":1,"rag":1,"rail":1,"railroad":1,"railway":1,"rain":1,"rainbow":1,"rainy":1,"raise":1,"raisin":1,"rake":1,"ram":1,"ran":1,"ranch":1,"rang":1,"rap":1,"rapidly":1,"rat":1,"rate":1,"rather":1,"rattle":1,"raw":1,"ray":1,"reach":1,"read":1,"reader":1,"reading":1,"ready":1,"real":1,"really":1,"reap":1,"rear":1,"reason":1,"rebuild":1,"receive":1,"recess":1,"record":1,"red":1,"redbird":1,"redbreast":1,"refuse":1,"reindeer":1,"rejoice":1,"remain":1,"remember":1,"remind":1,"remove":1,"rent":1,"repair":1,"repay":1,"repeat":1,"report":1,"rest":1,"return":1,"review":1,"reward":1,"rib":1,"ribbon":1,"rice":1,"rich":1,"rid":1,"riddle":1,"ride":1,"rider":1,"riding":1,"right":1,"rim":1,"ring":1,"rip":1,"ripe":1,"rise":1,"rising":1,"river":1,"road":1,"roadside":1,"roar":1,"roast":1,"rob":1,"robber":1,"robe":1,"robin":1,"rock":1,"rocket":1,"rocky":1,"rode":1,"roll":1,"roller":1,"roof":1,"room":1,"rooster":1,"root":1,"rope":1,"rose":1,"rosebud":1,"rot":1,"rotten":1,"rough":1,"round":1,"route":1,"row":1,"rowboat":1,"royal":1,"rub":1,"rubbed":1,"rubber":1,"rubbish":1,"rug":1,"rule":1,"ruler":1,"rumble":1,"run":1,"rung":1,"runner":1,"running":1,"rush":1,"rust":1,"rusty":1,"rye":1,"sack":1,"sad":1,"saddle":1,"sadness":1,"safe":1,"safety":1,"said":1,"sail":1,"sailboat":1,"sailor":1,"saint":1,"salad":1,"sale":1,"salt":1,"same":1,"sand":1,"sandwich":1,"sandy":1,"sang":1,"sank":1,"sap":1,"sash":1,"sat":1,"satin":1,"satisfactory":1,"saturday":1,"sausage":1,"savage":1,"save":1,"savings":1,"saw":1,"say":1,"scab":1,"scales":1,"scare":1,"scarf":1,"school":1,"schoolboy":1,"schoolhouse":1,"schoolmaster":1,"schoolroom":1,"scorch":1,"score":1,"scrap":1,"scrape":1,"scratch":1,"scream":1,"screen":1,"screw":1,"scrub":1,"sea":1,"seal":1,"seam":1,"search":1,"season":1,"seat":1,"second":1,"secret":1,"see":1,"seed":1,"seeing":1,"seek":1,"seem":1,"seen":1,"seesaw":1,"select":1,"self":1,"selfish":1,"sell":1,"send":1,"sense":1,"sent":1,"sentence":1,"separate":1,"september":1,"servant":1,"serve":1,"service":1,"set":1,"setting":1,"settle":1,"settlement":1,"seven":1,"seventeen":1,"seventh":1,"seventy":1,"several":1,"sew":1,"shade":1,"shadow":1,"shady":1,"shake":1,"shaker":1,"shaking":1,"shall":1,"shame":1,"shan't":1,"shant":1,"shape":1,"share":1,"sharp":1,"shave":1,"she":1,"she'd":1,"she'll":1,"she's":1,"shear":1,"shears":1,"shed":1,"shed":1,"sheep":1,"sheet":1,"shelf":1,"shell":1,"shell":1,"shepherd":1,"shes":1,"shine":1,"shining":1,"shiny":1,"ship":1,"shirt":1,"shock":1,"shoe":1,"shoemaker":1,"shone":1,"shook":1,"shoot":1,"shop":1,"shopping":1,"shore":1,"short":1,"shot":1,"should":1,"shoulder":1,"shouldn't":1,"shouldnt":1,"shout":1,"shovel":1,"show":1,"shower":1,"shut":1,"shy":1,"sick":1,"sickness":1,"side":1,"sidewalk":1,"sideways":1,"sigh":1,"sight":1,"sign":1,"silence":1,"silent":1,"silk":1,"sill":1,"silly":1,"silver":1,"simple":1,"sin":1,"since":1,"sing":1,"singer":1,"single":1,"sink":1,"sip":1,"sir":1,"sis":1,"sissy":1,"sister":1,"sit":1,"sitting":1,"six":1,"sixteen":1,"sixth":1,"sixty":1,"size":1,"skate":1,"skater":1,"ski":1,"skin":1,"skip":1,"skirt":1,"sky":1,"slam":1,"slap":1,"slate":1,"slave":1,"sled":1,"sleep":1,"sleepy":1,"sleeve":1,"sleigh":1,"slept":1,"slice":1,"slid":1,"slide":1,"sling":1,"slip":1,"slipped":1,"slipper":1,"slippery":1,"slit":1,"slow":1,"slowly":1,"sly":1,"smack":1,"small":1,"smart":1,"smell":1,"smile":1,"smoke":1,"smooth":1,"snail":1,"snake":1,"snap":1,"snapping":1,"sneeze":1,"snow":1,"snowball":1,"snowflake":1,"snowy":1,"snuff":1,"snug":1,"so":1,"soak":1,"soap":1,"sob":1,"socks":1,"sod":1,"soda":1,"sofa":1,"soft":1,"soil":1,"sold":1,"soldier":1,"sole":1,"some":1,"somebody":1,"somehow":1,"someone":1,"something":1,"sometime":1,"sometimes":1,"somewhere":1,"son":1,"song":1,"soon":1,"sore":1,"sorrow":1,"sorry":1,"sort":1,"soul":1,"sound":1,"soup":1,"sour":1,"south":1,"southern":1,"space":1,"spade":1,"spank":1,"sparrow":1,"speak":1,"speaker":1,"spear":1,"speech":1,"speed":1,"spell":1,"spelling":1,"spend":1,"spent":1,"spider":1,"spike":1,"spill":1,"spin":1,"spinach":1,"spirit":1,"spit":1,"splash":1,"spoil":1,"spoke":1,"spook":1,"spoon":1,"sport":1,"spot":1,"spread":1,"spring":1,"springtime":1,"sprinkle":1,"square":1,"squash":1,"squeak":1,"squeeze":1,"squirrel":1,"stable":1,"stack":1,"stage":1,"stair":1,"stall":1,"stamp":1,"stand":1,"star":1,"stare":1,"start":1,"starve":1,"state":1,"states":1,"station":1,"stay":1,"steak":1,"steal":1,"steam":1,"steamboat":1,"steamer":1,"steel":1,"steep":1,"steeple":1,"steer":1,"stem":1,"step":1,"stepping":1,"stick":1,"sticky":1,"stiff":1,"still":1,"stillness":1,"sting":1,"stir":1,"stitch":1,"stock":1,"stocking":1,"stole":1,"stone":1,"stood":1,"stool":1,"stoop":1,"stop":1,"stopped":1,"stopping":1,"store":1,"stories":1,"stork":1,"storm":1,"stormy":1,"story":1,"stove":1,"straight":1,"strange":1,"stranger":1,"strap":1,"straw":1,"strawberry":1,"stream":1,"street":1,"stretch":1,"string":1,"strip":1,"stripes":1,"strong":1,"stuck":1,"study":1,"stuff":1,"stump":1,"stung":1,"subject":1,"such":1,"suck":1,"sudden":1,"suffer":1,"sugar":1,"suit":1,"sum":1,"summer":1,"sun":1,"sunday":1,"sunflower":1,"sung":1,"sunk":1,"sunlight":1,"sunny":1,"sunrise":1,"sunset":1,"sunshine":1,"supper":1,"suppose":1,"sure":1,"surely":1,"surface":1,"surprise":1,"swallow":1,"swam":1,"swamp":1,"swan":1,"swat":1,"swear":1,"sweat":1,"sweater":1,"sweep":1,"sweet":1,"sweetheart":1,"sweetness":1,"swell":1,"swept":1,"swift":1,"swim":1,"swimming":1,"swing":1,"switch":1,"sword":1,"swore":1,"table":1,"tablecloth":1,"tablespoon":1,"tablet":1,"tack":1,"tag":1,"tail":1,"tailor":1,"take":1,"taken":1,"taking":1,"tale":1,"talk":1,"talker":1,"tall":1,"tame":1,"tan":1,"tank":1,"tap":1,"tape":1,"tar":1,"tardy":1,"task":1,"taste":1,"taught":1,"tax":1,"tea":1,"teach":1,"teacher":1,"team":1,"tear":1,"tease":1,"teaspoon":1,"teeth":1,"telephone":1,"tell":1,"temper":1,"ten":1,"tennis":1,"tent":1,"term":1,"terrible":1,"test":1,"than":1,"thank":1,"thankful":1,"thanks":1,"thanksgiving":1,"that":1,"that's":1,"thats":1,"the":1,"theater":1,"thee":1,"their":1,"them":1,"then":1,"there":1,"these":1,"they":1,"they'd":1,"they'll":1,"they're":1,"they've":1,"theyd":1,"theyll":1,"theyre":1,"theyve":1,"thick":1,"thief":1,"thimble":1,"thin":1,"thing":1,"think":1,"third":1,"thirsty":1,"thirteen":1,"thirty":1,"this":1,"thorn":1,"those":1,"though":1,"thought":1,"thousand":1,"thread":1,"three":1,"threw":1,"throat":1,"throne":1,"through":1,"throw":1,"thrown":1,"thumb":1,"thunder":1,"thursday":1,"thy":1,"tick":1,"ticket":1,"tickle":1,"tie":1,"tiger":1,"tight":1,"till":1,"time":1,"tin":1,"tinkle":1,"tiny":1,"tip":1,"tiptoe":1,"tire":1,"tired":1,"title":1,"to":1,"toad":1,"toadstool":1,"toast":1,"tobacco":1,"today":1,"toe":1,"together":1,"toilet":1,"told":1,"tomato":1,"tomorrow":1,"ton":1,"tone":1,"tongue":1,"tonight":1,"too":1,"took":1,"tool":1,"toot":1,"tooth":1,"toothbrush":1,"toothpick":1,"top":1,"tore":1,"torn":1,"toss":1,"touch":1,"tow":1,"toward":1,"towards":1,"towel":1,"tower":1,"town":1,"toy":1,"trace":1,"track":1,"trade":1,"train":1,"tramp":1,"trap":1,"tray":1,"treasure":1,"treat":1,"tree":1,"trick":1,"tricycle":1,"tried":1,"trim":1,"trip":1,"trolley":1,"trouble":1,"truck":1,"true":1,"truly":1,"trunk":1,"trust":1,"truth":1,"try":1,"tub":1,"tuesday":1,"tug":1,"tulip":1,"tumble":1,"tune":1,"tunnel":1,"turkey":1,"turn":1,"turtle":1,"twelve":1,"twenty":1,"twice":1,"twig":1,"twin":1,"two":1,"ugly":1,"umbrella":1,"uncle":1,"under":1,"understand":1,"underwear":1,"undress":1,"unfair":1,"unfinished":1,"unfold":1,"unfriendly":1,"unhappy":1,"unhurt":1,"uniform":1,"united":1,"unkind":1,"unknown":1,"unless":1,"unpleasant":1,"until":1,"unwilling":1,"up":1,"upon":1,"upper":1,"upset":1,"upside":1,"upstairs":1,"uptown":1,"upward":1,"us":1,"use":1,"used":1,"useful":1,"valentine":1,"valley":1,"valuable":1,"value":1,"vase":1,"vegetable":1,"velvet":1,"very":1,"vessel":1,"victory":1,"view":1,"village":1,"vine":1,"violet":1,"visit":1,"visitor":1,"voice":1,"vote":1,"wag":1,"wagon":1,"waist":1,"wait":1,"wake":1,"waken":1,"walk":1,"wall":1,"walnut":1,"want":1,"war":1,"warm":1,"warn":1,"was":1,"wash":1,"washer":1,"washtub":1,"wasn't":1,"wasnt":1,"waste":1,"watch":1,"watchman":1,"water":1,"watermelon":1,"waterproof":1,"wave":1,"wax":1,"way":1,"wayside":1,"we":1,"we'd":1,"we'll":1,"we're":1,"we've":1,"weak":1,"weaken":1,"weakness":1,"wealth":1,"weapon":1,"wear":1,"weary":1,"weather":1,"weave":1,"web":1,"wed":1,"wedding":1,"wednesday":1,"wee":1,"weed":1,"week":1,"weep":1,"weigh":1,"welcome":1,"well":1,"well":1,"went":1,"were":1,"were":1,"west":1,"western":1,"wet":1,"weve":1,"whale":1,"what":1,"what's":1,"whats":1,"wheat":1,"wheel":1,"when":1,"whenever":1,"where":1,"which":1,"while":1,"whip":1,"whipped":1,"whirl":1,"whiskey":1,"whisky":1,"whisper":1,"whistle":1,"white":1,"who":1,"who'd":1,"who'll":1,"who's":1,"whod":1,"whole":1,"wholl":1,"whom":1,"whos":1,"whose":1,"why":1,"wicked":1,"wide":1,"wife":1,"wiggle":1,"wild":1,"wildcat":1,"will":1,"willing":1,"willow":1,"win":1,"wind":1,"windmill":1,"window":1,"windy":1,"wine":1,"wing":1,"wink":1,"winner":1,"winter":1,"wipe":1,"wire":1,"wise":1,"wish":1,"wit":1,"witch":1,"with":1,"without":1,"woke":1,"wolf":1,"woman":1,"women":1,"won":1,"won't":1,"wonder":1,"wonderful":1,"wont":1,"wood":1,"wooden":1,"woodpecker":1,"woods":1,"wool":1,"woolen":1,"word":1,"wore":1,"work":1,"worker":1,"workman":1,"world":1,"worm":1,"worn":1,"worry":1,"worse":1,"worst":1,"worth":1,"would":1,"wouldn't":1,"wouldnt":1,"wound":1,"wove":1,"wrap":1,"wrapped":1,"wreck":1,"wren":1,"wring":1,"write":1,"writing":1,"written":1,"wrong":1,"wrote":1,"wrung":1,"yard":1,"yarn":1,"year":1,"yell":1,"yellow":1,"yes":1,"yesterday":1,"yet":1,"yolk":1,"yonder":1,"you":1,"you'd":1,"you'll":1,"you're":1,"you've":1,"youd":1,"youll":1,"young":1,"youngster":1,"your":1,"youre":1,"yours":1,"yourself":1,"yourselves":1,"youth":1,"youve":1};
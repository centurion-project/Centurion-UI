(function($) {
    
    if(!$.CUI){
        $.CUI = new Object();
    };
    
    /*
     *  --- GRID DATAS AND MEDIAS ---
     */
    
    $.CUI.Grid = function(el, options){
        
        // base, jQuery and DOM element
        base = this;
        base.$el = $(el);
        base.el = el;
        
        // Add a reverse reference to the DOM object
        base.$el.data("CUI.Form", base);

        // Initialization
        base.init = function(){
            base.options = $.extend({},$.CUI.Grid.defaultOptions, options);
            
            base.rowTemplate = base.$el.find(".row-template").clone().removeClass("row-template");
            base.$el.coord = base.$el.offset();                
             
            $(base.options.filter).find('input[type=submit]').hide();
            $(base.options.action).find('input[type=submit]').hide();
            
            if(base.options.callback) {
                base.options.callback();
            }
             
            var anchor = window.location.hash;
            if(anchor) {
                anchor = anchor.substring(1,anchor.length);
            }
            $.history.init(base.setDatas, anchor);
            // events definitions
            // rows events
            base.$el.find(".row")
                .live("mouseenter", function() {
                    $(this).addClass("hover")
                })
                .live("mouseleave", function() {
                    $(this).removeClass("hover")
                })
                .live("click", function() {
                    if($(this).hasClass("select")) {
                        $(this).removeClass("select")
                               .find("input[type=checkbox]").removeAttr("checked");
                    } else {
                        $(this).addClass("select").find("input[type=checkbox]").attr("checked", "checked");
                    }
                });
            base.$el.find('.row').find("a, .switch-1, .switch-0")
                .live("click", function(event) {
                    var rowEl = $(this).parents('.row');
                    if(rowEl.hasClass("select"))  {
                        rowEl.removeClass("select").find("input[type=checkbox]").removeAttr("checked");
                    }
                    else {
                        rowEl.addClass("select").find("input[type=checkbox]").attr("checked", "checked");
                    }
                    //event.stopPropagation();
                }); 
                         
            // actions event
            $(base.options.action).find(":input").bind("change", function(){
                $(base.options.action).submit();
            });
            
            // select event
            $(base.options.action).find('a.select-all').live('click', function() { 
                    base.$el.find('input[type=checkbox]').each(function(){
                        $(this).parent().parent().addClass('select');
                        $(this).attr('checked', 'checked');
                        });
                    return false;
                });  
            $(base.options.action).find('a.select-none').live('click', function() {
                    base.$el.find('input[type=checkbox]').each(function(){
                        $(this).parent().parent().removeClass('select');
                        $(this).removeAttr('checked');
                        });
                    return false;
                }); 
                
            // pager event
            $(base.options.action).find('.pager a').live("click", function() {
                //$.history.load('json.html');
                $.history.load($(this).attr("href"));
                return false;
            });    
              
            // sorting event         
            base.$el.find('.head a').live("click", function() {
                //$.history.load('json.html');
                $.history.load($(this).attr("href"));
                return false;
            });   
              
            // filters events
            $(base.options.filter).find('h3')
                .mouseenter(function() {
                    $('body').css('cursor', 'pointer');
                })
                .mouseleave(function() {
                    $('body').css('cursor', 'auto');
                })
                .click(function() { 
                    var filterDiv = $(this).parent();
                    if(filterDiv.hasClass('filter-closed')) { 
                        filterDiv.removeClass('filter-closed')     
                    }
                    else {
                        filterDiv.addClass('filter-closed')
                    }               
                });            
            $(base.options.filter).find(":input").live("change", function(){
                var url = $(base.options.filter).attr("action") + '?submit=submit&' + $(base.options.filter).serialize();
                //$.history.load('json.html');
                $.history.load(url);
                return false;
            });
        };
        

        // Set datas via ajax request        
        base.setDatas = function(url) {
            if(url == '') {
                return;
            }
            
            // loading
            $('.grid-loading')
                .appendTo('body')
                .css('position', 'absolute')
                .css('top', base.$el.coord.top + (base.$el.height() / 2))
                .css('left', base.$el.coord.left + (base.$el.width() / 2))
                .show();
            base.$el.fadeTo(0, 0.5);               
            
            // request start
            
            $.getJSON(url, function(data) {
                
                $('.grid-debug').html(data.debug);
                
                // Update header links
                $.each(data.header, function(i,link){
                    base.$el.find(".head")
                            .eq(i)
                            .removeClass("sorting-asc")
                            .removeClass("sorting-desc")
                            .find("a").attr("href", link.url);
                    
                    if(link.sort) {
                        base.$el.find(".head").eq(i).addClass("sorting-"+link.sort);
                    }   
                });
                
                // Update rows
                base.$el.find('.row').not('.row-template').remove();
                $.each(data.rows.reverse(), function(i,row){
                    rowHtml = base.rowTemplate.clone().insertAfter(base.$el.find(".row-template"));
                    $.each(row, function(j,data){
                        rowHtml.children().eq(j).html(data);
                    });
                });
                base.$el.find('.row:even').not('.row-template').addClass('even');
                base.$el.find('.row:odd').not('.row-template').addClass('odd');
                
                
                // Update pager links
                $(base.options.action).find('.pager').empty();
                $.each(data.pager, function(i,pager){
                    if(pager.url) {
                        $("<a/>", {
                            "class": i,
                            href: pager.url,
                            text: pager.label
                        }).appendTo($(base.options.action).find('.pager')).before('&nbsp;');
                    } else {
                        if(pager.url != "") {
                            $("<span/>", {
                                "class": i,
                                html: pager.label
                            }).appendTo($(base.options.action).find('.pager')).before('&nbsp;');
                        }
                    }
                });
                
                // Update filter url action
                $(base.options.filter).attr('action', data.filter);
                
                // end
                $('.grid-loading').hide();
                base.$el.fadeTo(0, 1); 
                
                // callback function(s)
                if(base.options.callback) {
                    base.options.callback();
                } 
            });
        }
 
        // Run initializer
        base.init();
    };
    
    $.CUI.Grid.defaultOptions = {
        filter: '#grid-filter-form',
        action: '#grid-action-form'
    };


    /*
     *  --- FORMS ELEMENTS ---
     */

    $.CUI.Form = function(el, plugin, options){
    
        // base, jQuery and DOM element
        var base = this;
        base.$el = $(el);
        base.el = el;
        
        // Add a reverse reference to the DOM object
        base.$el.data("CUI.Form", base);

        // Initialization
        base.init = function(){
            base.options = $.extend({}, $.CUI.Grid.defaultOptions, options);
            base.options.plugin = plugin;
            (base[base.options.plugin])(options);
        };
        
        // switcher
        base.switcher = function() {
            var selectedOption = base.$el.find('option:selected').val()
            if(base.$el.attr('selected')){
                selectedOption = base.$el.attr('selected')
            }
            
            var output = $('<span/>', {
                "class" : "switch-" + selectedOption,
                text : selectedOption
            }).bind("click", function(){
            	
                if(base.options.onclick) { 
                    base.options.onclick(base.$el) 
                } else if (base.options.url != undefined) {
                	var saveThis = this;
                	$.post(base.options.url, {name: base.$el[0].name, value:base.$el[0].value}, function(data){
                        if (data.statut !== 200) {
                            alert('probleme');
                        } else {
                        	if(data.value == 0) {
                                $(saveThis).removeClass('switch-1').addClass('switch-0').empty().append('Offline');
                                base.$el.find('option[value=0]').attr('selected', 'selected');
                            } else {
                                $(saveThis).removeClass('switch-0').addClass('switch-1').empty().append('Online');
                                base.$el.find('option[value=1]').attr('selected', 'selected');                                
                            }
                        }
                    });
                } else {
                	if($(this).hasClass('switch-1')) {
                        $(this).removeClass('switch-1').addClass('switch-0').empty().append('Offline');
                        base.$el.find('option[value=0]').attr('selected', 'selected');
                    } else {
                        $(this).removeClass('switch-0').addClass('switch-1').empty().append('Online');
                        base.$el.find('option[value=1]').attr('selected', 'selected');                                
                    }
                }
            }).insertAfter(base.$el);
            
            base.$el.hide();       
        }

        base.multiselect = function() {
            // init
            var output = $('<div class="nicy-multiselect"/>');
            var selectedContainer = $('<div class="selectedContainer"/>');
            var selectedActions = $('<div class="actions"><span class="count"></span><a href="#" class="remove-all">Remove All</a></div>');
            var selectedList = $('<ul class="selectedList"/>');
            var availableContainer = $('<div class="availableContainer"/>');
            var availableActions = $('<div class="actions"><input type="text" class="search" name="multiselect-search" value="" /><a href="#" class="add-all">Add All</a></div>');
            var availableList = $('<ul class="availableList"/>');
            var nbSelected = 0;    

            // update the selected items count
            base.multiselect.updateCount = function () {
                if(nbSelected <= 1) {
                    $(output).find('.count').empty()
                                            .append(nbSelected + ' item selected');
                    if(nbSelected == 0) {
                        $(output).prev().find('option[value=]').attr('selected','selected');
                    }
                } else {
                    $(output).find('.count').empty()
                                            .append(nbSelected + ' items selected');
                }
            }  
             
            // generate
            base.$el.find('option:selected').not('[value=]').each(function() {
                $(selectedList).append('<li><a href="#" rel="'+$(this).val()+'"><span class="icon"></span>'+$(this).text()+'</a></li>');
                nbSelected = nbSelected + 1;
            })
            
            base.$el.find('option').not(':selected').not('[value=]').each(function() {
                $(availableList).append('<li><a href="#" rel="'+$(this).val()+'"><span class="icon"></span>'+$(this).text()+'</a></li>');
            });
            
            // displaying
            base.$el.hide();
            $(selectedContainer)
                .append(selectedActions)
                .append(selectedList);
            $(availableContainer)
                .append(availableActions)
                .append(availableList);
            $(output)
                .append(selectedContainer)
                .append(availableContainer)
                .insertAfter(base.$el);  
            base.multiselect.updateCount();

            // events
            $(output).find('li a').bind('click', function() {
                if($(this).parent().parent().hasClass('availableList')) {
                    $(this).parent().hide().prependTo(selectedList).fadeIn("slow"); 
                    base.$el.find('option[value='+$(this).attr('rel')+']').attr("selected", "selected");
                    nbSelected = nbSelected + 1; 
                }
                else
                {
                    $(this).parent().fadeOut("fast", function() {
                        $(this).prependTo(availableList).show();
                    })
                    base.$el.find('option[value='+$(this).attr('rel')+']').removeAttr("selected");
                    nbSelected = nbSelected - 1;
                }
                base.multiselect.updateCount();
                return false;
            });
            
            $(output).find('.add-all').bind('click', function() {
                $(availableList).find('li').each(function() {
                    $(selectedList).append(this);
                    base.$el.find('option[value='+$(this).find('a').attr('rel')+']').attr("selected", "selected");
                    nbSelected = nbSelected + 1;
                }); 
                base.multiselect.updateCount();
                return false;
            });                 
            
            $(output).find('.remove-all').bind('click', function() {
                $(selectedList).find('li').each(function() {
                    $(availableList).append(this);
                    base.$el.find('option[value='+$(this).find('a').attr('rel')+']').removeAttr("selected");
                    nbSelected = 0;
                }); 
                base.multiselect.updateCount();
                return false;
            });

            // taken from John Resig's liveUpdate script
            $(output).find('.search').bind('keyup', function() {
                var input = $(this);
                var rows = availableList.children('li'),
                    cache = rows.map(function(){
                        return $(this).text().toLowerCase();
                    });
                var term = $.trim(input.val().toLowerCase()), scores = [];
                if (!term) {
                    rows.show();
                } else {
                    rows.hide();
                    cache.each(function(i) {
                        if (this.indexOf(term)>-1) { scores.push(i); }
                    });
                    $.each(scores, function() {
                        $(rows[this]).show();
                    });
                }
            }); 

            if(base.$el.parents("fieldset.aside").length) {
                availableList.hide();
                var addLink = $("<a/>", {
                    "class": "ui-button ui-button-text-only",
                    "href": "#",
                    "html": "<span class=\"ui-button-text\">Add a new</span>"                   
                }).bind("click", function () {
                    availableList.show();
                    $(this).hide();
                    return false;
                }).prependTo(availableContainer);
                availableList.find('a').bind("click", function() {
                    availableList.hide();
                    addLink.show();
                    
                });
            }
        }
        
        base.fieldset = function() {
            var expandLink = $("<a/>", {
                html: "<span class=\"icon icon-less\"></span> Minimize",
                "class": "expand"
            }).insertBefore(base.$el)
              .bind("click", function() {
                if(base.$el.hasClass('fieldset-closed')) {
                    base.$el.removeClass('fieldset-closed');
                    expandLink.html("<span class=\"icon icon-less\"></span> Minimize");
                } else {
                    base.$el.addClass('fieldset-closed');
                    expandLink.html("<span class=\"icon\"></span> Maximize");
                }
            });
            
            if(base.$el.prev().prev().length) {
                expandLink.html("<span class=\"icon\"></span> Maximize");
                base.$el.addClass('fieldset-closed');
            }
        }

        base.letterLimit = function() {
            var counter = $("<div>", {
                "class": "count-letter",
                text: base.options.maxChar
            }).insertBefore(base.$el);

            // Update counter function
            base.letterLimit.updateCount = function () {
                var nbLetters = base.$el.val().length;
                var count = base.options.maxChar - base.$el.val().length;
                counter.text(count);
                if (count < 0) {
                    counter.addClass("count-letter-hot")
                             .removeClass("count-letter-cold");
                } else { 
                    counter.addClass("count-letter-cold")
                             .removeClass("count-letter-hot");
                }
            }

            base.letterLimit.updateCount();
            
            // Key up event
            base.$el.bind('keyup', base.letterLimit.updateCount);
        }

        base.file = function() { 
            var wrapper = base.$el.parents('.form-item').find(".ui-button-tiny-squared").show();
            var filename = base.$el.parents('.form-item').find(".field-preview-wrapper");
            base.$el.prependTo(wrapper);
            base.$el.css({
                "position": "absolute",
                "top": "3px",
                "left": "3px",
                "z-index": "3",
                "height": "22px",
                "width": "250px",
                "display": "inline",
                "cursor": "pointer",
                "opacity": "0.0"
            });
            if ($.browser.mozilla) {
                if (/Win/.test(navigator.platform)) {
                    base.$el.css("left", "-142px");
                } else {
                    base.$el.css("left", "-168px");
                };
            } else {
                base.$el.css("left", "-167px");
            };
            base.$el.bind("change", function() {
                filename.html('<input type="checkbox" checked="checked" value="1" class="field-checkbox" '+
                              'name="filename_delete_logo"><div class="description">'+
                              base.$el.val()+'</div><div class="clear"></div>');
            });
        }

        // Run initializer
        base.init();
    };
     
    $.CUI.Form.defaultOptions = {
        
    };


    /*
     *  --- DISPATCHER ---
     */
    
    $.CUI.Include = function(plugin){
        if ($.CUI.IncludeFiles[plugin] != 0) {
            $.each($.CUI.IncludeFiles[plugin], function(i, file){
                $('body').append($('<script />', {
                    "type": "text/javascript",
                    "language": "javascript",
                    "src": file
                }));
            $.CUI.IncludeFiles[plugin] = 0;
            });
        }
    }
    $.CUI.IncludeFiles = {
         'jquery-ui':       ['/cui/libs/jquery-ui.js'],
         'jquery-history':  ['/cui/plugins/utils/jquery.history.js'],
         'swfupload':       ['/cui/plugins/swfupload/swfupload.js',
                             '/cui/plugins/swfupload/swfupload.queue.js',
                             '/cui/plugins/swfupload/fileprogress.js',
                             '/cui/plugins/swfupload/handlers.js'],
         'tinymce':         ['/cui/plugins/tinymce/jquery.tinymce.js'],
         'jquery-jstree':   ['/cui/plugins/utils/mustache.js',
                             '/cui/plugins/utils/jquery.cookie.js',
                             '/cui/plugins/jstree/jquery.tree.js',
                             '/cui/plugins/jstree/jquery.tree.contextmenu.js']
    }
    
    $.fn.CUI = function(plugin, options) {
        return this.each(function(){
            switch (plugin) {
                case 'grid':
                    // CUI Grid for datas and medias:
                    (new $.CUI.Include('jquery-history'));
                    (new $.CUI.Grid(this, options));
                break;
                case 'switcher':
                case 'multiselect':
                case 'fieldset':
                case 'letterLimit':
                case 'file':
                    // CUI Form elements:
                    (new $.CUI.Form(this, plugin, options));
                break;
                case 'tree':
                    // JSTree:
                    (new $.CUI.Include('jquery-jstree'));
                    $(this).tree(options);

                break;
                case 'files':
                    // SwfUpload:
                    (new $.CUI.Include('swfupload'));
                    var swfu;
                    var defaultOptions = {

                        // Button settings
                        button_image_url: "/layout/backoffice/images/px.png",
                        button_width: "75",
                        button_height: "22",
                        button_placeholder_id: "spanButtonPlaceHolder",
                        button_text: '<span class="btn-upload">Upload Files</span>',
                        button_text_style: ".btn-upload { font-family: Arial; font-size: 11px; color:#5b5b5b; }",
                        button_text_left_padding: 0,
                        button_text_top_padding: 0,
                        button_window_mode: "transparent",
                        // The event handler functions are defined in handlers.js
                        init_swfupload_handler : initSwfupload,
                        file_queued_handler : fileQueued,
                        file_queue_error_handler : fileQueueError,
                        file_dialog_complete_handler : fileDialogComplete,
                        upload_start_handler : uploadStart,
                        upload_progress_handler : uploadProgress,
                        upload_error_handler : uploadError,
                        upload_success_handler : uploadSuccess,
                        upload_complete_handler : uploadComplete,
                        queue_complete_handler : queueComplete  
                    };
                    settings = $.extend({}, defaultOptions, options);
                    swfu = new SWFUpload(settings); 
                break;
                case 'rte':
                    // TinyMCE:
                    (new $.CUI.Include('tinymce'));
                    var defaultOptions = {
                        script_url : '/cui/plugins/tinymce/tiny_mce.js',
                        theme : "advanced",
                        width : '100%',
                        height : '400',
                        plugins : "safari,pagebreak,style,layer,table,save,advhr,advimage,advlink,emotions,iespell,"
                                + "insertdatetime,preview,media,searchreplace,print,contextmenu,paste,directionality,"
                                + "fullscreen,noneditable,visualchars,nonbreaking,xhtmlxtras,template",
                        theme_advanced_buttons1 : "undo,redo,separator,bold,italic,underline,forecolor,formatselect,"
                                                + "styleselect,separator,bullist,numlist,link,unlink,image,separator,code",
                        theme_advanced_buttons2 : "",
                        theme_advanced_buttons3 : "",   
                        theme_advanced_toolbar_location : "top",
                        theme_advanced_toolbar_align : "left",
                        theme_advanced_statusbar_location : "bottom",
                        theme_advanced_resizing : true
                    }
                    settings = $.extend({}, defaultOptions, options);
                    $(this).tinymce(settings);
                break;
                default: 
                    // jQuery UI:
                    (new $.CUI.Include('jquery-ui'));
                    ($(this)[plugin])(options);
                break;
            }
        })
    }
    


    
})(jQuery);


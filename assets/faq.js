;(function(exports, $) {
	"use strict";

    function FAQs() {
        this.fetched = false;
        this.faqtmpl = undefined;
        this.sectionLists = [];
    }

    FAQs.prototype.init = function(tiddlyweb, options) {
        this.userIsMember = (tiddlyweb.status.space.recipe.match(/_private$/)) ? true : false;
        this.settings = $.extend({
            templateSelector: "#faq-template",
            containerSelector: "#main",
            sections: ["TiddlySpace"],
            callback: $.noop
        }, options);
        // set up faq buckets
        var i, sections = this.settings.sections;
        for(var i = 0; i < sections.length; i++) {
            this.sectionLists[ sections[i].toLowerCase() + "_faqs" ] = [];
        }
        this.faqtmpl = Handlebars.compile( $(this.settings.templateSelector).html() );
        this.$main = $( this.settings.containerSelector );
        this.bindUIEvents();
        this.fetchFAQs();
    };

    FAQs.prototype.fetchFAQs = function() {
        var context = this;
        $.getJSON("http://faq.tiddlyspace.com/tiddlers.json?select=tag:FAQ&fat=1&render=1", function(resp) {
            if(resp) {
                _.each(resp, function(item, index, remaining) {
                    var i, sections = context.settings.sections;
                    for(i = 0; i < sections.length; i++) {
                        if( _.contains(item.tags, sections[i]) ) {
                            var arr_name = sections[i].toLowerCase() +"_faqs";
                            context.sectionLists[ arr_name ].push( item );
                        }
                    }
                });
                context.fetched = true;
                $.event.trigger("fetched");
            }
        });
    };

    FAQs.prototype.createEditLink = function(tidTitle) {
        var twS = tiddlyweb.status,
            twServer = twS.server_host;
        if( twS.username === "GUEST" ) {
            return "#";
        } else {
            return twServer.scheme + "://" + twS.space.name + "." + 
                        twServer.host + "/edit#" + tidTitle;
        }
    };

    FAQs.prototype.generateFAQSection = function(type) {
        var context = this;
        var faqList = context.sectionLists[type+"_faqs"];
        var header = $("<header></header>").append( $("<h2></h2>", {"text":type, "class": "open"}) ),
            section = $("<section></section>")
                        .attr("id", type)
                        .addClass("open")
                        .append( header ),
            faqwrap = $("<article></article>").appendTo(section);

        _.each(faqList, function(faq, index, list) {
            var data = {
                title: faq.title,
                href: context.createEditLink( faq.title ),
                userIsMember: context.userIsMember
            };

            $( context.faqtmpl(data) )
                .find("dd")
                    .append( faq.render )
                    .end()
                .appendTo(faqwrap);

        });
        return section;
    };

    FAQs.prototype.bindUIEvents = function() {
        var context = this;
        $( document ).on("fetched", function() {
            $("body").addClass("fetched");
            context.renderSections();
            context.settings.callback();
        });
        context.$main.on("click", "dt", function(e) {
            $(this)
                .parent('dl')
                    .toggleClass('closed');
        });
    };

    FAQs.prototype.renderSections = function() {
        var i, sections = this.settings.sections;
        for(i = 0; i < sections.length; i++) {
            this.$main.append(this.generateFAQSection( sections[i].toLowerCase() ));
        }
    };

    exports.FAQs = new FAQs();

}(window, jQuery));

;(function($) {
	"use strict";
	var fetched = false,
        userIsMember = (tiddlyweb.status.space.recipe.match(/_private$/)) ? true : false,
		ts_faqs = [],
		tw_faqs = [],
		faqtmpl;

	$.getJSON("http://faq.tiddlyspace.com/tiddlers.json?select=tag:FAQ&fat=1&render=1", function(resp) {
		if(resp) {
			_.each(resp, function(item, index, remaining) {
				if( _.contains(item.tags, "TiddlySpace") ) {
					ts_faqs.push( item );
				}
				if( _.contains(item.tags, "TiddlyWiki") ) {
					tw_faqs.push( item );
				}
			});
			fetched = true;
			$.event.trigger("fetched");
		}
	});

    function createEditLink(tidTitle) {
        var twS = tiddlyweb.status,
            twServer = twS.server_host;
        if( twS.username === "GUEST" ) {
            return "#";
        } else {
            return twServer.scheme + "://" + twS.space.name + "." + 
                        twServer.host + "/edit#" + tidTitle;
        }
    }

	function generateFAQSection(type) {
		var faqList = (type && type === "tiddlywiki") ? tw_faqs : ts_faqs;
        var header = $("<header></header>").append( $("<h2></h2>", {"text":type, "class": "open"}) ),
            section = $("<section></section>")
                        .attr("id", type)
                        .addClass("open")
                        .append( header ),
			faqwrap = $("<article></article>").appendTo(section);

		_.each(faqList, function(faq, index, list) {
			var data = {
				title: faq.title,
				href: createEditLink( faq.title ),
				userIsMember: userIsMember
			};

			$( faqtmpl(data) )
				.find("dd")
					.append( faq.render )
					.end()
				.appendTo(faqwrap);

		});
		return section;
	}

	$(function() {
		faqtmpl = Handlebars.compile($("#faq-template").html());
		var $main = $("#main");

		function renderBothSets() {
			$main.append(generateFAQSection('tiddlyspace'));
            $main.append(generateFAQSection('tiddlywiki'));
            $("#main").sieve({ itemSelector: "dl", textSelector: "dt", searchInput: $("#faqSearch") });
		}

		if(fetched) {
		    $("body").addClass("fetched");
			renderBothSets();
		} else {
			$( document ).bind("fetched", "#main", function() {
			    $("body").addClass("fetched");
				renderBothSets();
			});
		}

		$main.on("click", "dt", function(e) {
			var $this = $(this);
			$this
			    .parent('dl')
			        .toggleClass('closed');
		});

		
	});
}(jQuery));

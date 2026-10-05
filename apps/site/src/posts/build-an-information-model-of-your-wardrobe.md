---
title: Build an Information Model of your wardrobe
created: 2026-09-13
tags: Boundary Node
canonical: https://finlayhu.substack.com/p/build-an-information-model-of-your
---

_Understanding the basics of information models for anyone interested in how to represent the world in a systematised way. First published on [Boundary Node](https://finlayhu.substack.com/p/build-an-information-model-of-your), 13 September 2026._

## Our problem

Imagine a world where you wanted to create a system to organise laundry. I often end up with a pile of dirty clothes on my floor, one on a chair and another set in my actual laundry basket. What if we had a system that would help us understand where all of our clothes are?

The first thing that we would need to do is come up with some sort of system to represent the information about our laundry. We want that information to be structured in some way so that we can ask questions about it and act on it.

## What is an information model?

An information model is a formalised way to organise information. Almost anything you want to describe can be broken down in the same way: the things themselves, what’s true about them, and how they connect. Information models aim to formalise these things so that computer systems can understand them.

Let’s come up with a super simple way to describe our clothes. To be able to know where things are we first need to know what they are. A simple solution is making a list.

::table{src="wardrobe/01-list" title="Your wardrobe, as a list"}

If you wanted to ask the question “How many white pieces of clothing do I have?” you would have to read down the list of 46 items of clothes. It’s sortable alphabetically but nothing else. So let’s take another shot at this. Add some columns to this table and start listing multiples like “2 black polo shirts” as two separate black polo shirts to standardise how we count things (“plain white tees x4”, “3 pairs black socks”, “navy socks x2 pairs”). Let’s also add sizes to everything, an important property when you are looking to put together an outfit.

::table{src="wardrobe/02-fields" title="Your wardrobe, as a table"}

Now we can sort by colour and see that you have 7 items of white clothing. Our organisation is paying off!

We can represent this table in something called a UML (Unified Model Language) diagram. All this diagram says is that we have one type of thing called _Garment_ and it has 3 properties, _colour_, _what it is_, _size_. As we build up our information model this diagram will grow so that we can understand what our model looks like at a glance.

::figure{slug="bn-01-f1" caption="A box is an object, the properties of that object are the list inside it"}

How do we distinguish between the two white oxford shirts when we want to select one? This is where IDs come in, we should assign each item of clothing its own unique ID to allow us to distinguish identical pieces of clothing. We could write these IDs on the clothing’s wash tag so we can map the real world item to what we have in our system.

::table{src="wardrobe/03-ids" title="Your wardrobe, with IDs"}

Our UML diagram has now added _ID_ and _name_ columns. _name_ is separate from the previous _what it is_ which now just categorises what type of clothing it is.

::figure{slug="bn-01-f2"}

We now have _White Oxford g01_ and _White Oxford g02_. We can pick between them and identify them when they looked identical to our system before.

The size column meaning different things for the different items is causing issues though. A size 40 _Grey blazer_ is not comparable to a size 9 _Grey wool sock_. Let’s split the columns out.

::table{src="wardrobe/04a-sizes" title="Your wardrobe, with the sizes split out"}

This adds _waist_, _leg_ and _shoeSize_ to our UML.

::figure{slug="bn-01-f3"}

Sorting by one of the size columns now makes much more sense than the single one before. We can compare similar types of clothing by size rather than going through the full list.

Since we split our clothes from _grey wool socks_ into two _grey wool sock_ we now have a bunch of stray single socks. This is an issue we all face in real life, how do we find the matching socks? The IDs that we introduced before help here.

::table{src="wardrobe/04b-paired" title="Your wardrobe, with the socks paired up"}

By adding a _pairedWith_ column and using the IDs we added before, if we have one sock we can immediately find the other sock by looking at its _pairedWith_ column and finding the other sock with a matching ID.

::figure{slug="bn-01-f4"}

Notice the difference here on the UML diagram, this doesn’t just add a normal property to the type. We are now actually modelling a relationship rather than just a property of clothing, we are saying that one piece of clothing is related in some way to another. In this case one sock is _pairedWith_ another sock. UML specifies this by drawing a line between the two types (when you have a type related to itself it forms a loop). The 0..1 on the diagram here represents something called cardinality (or multiplicity). Cardinality specifies how many things can match other things. In this case 0..1 means that a _garment_ can be matched with a minimum of 0 other _garments_ and at most 1. It’s written twice because you have to describe both ends of the relationship. Each sock can only be paired with 0 or 1 socks.

However, look at our ugly table with all of the empty values. A _White Oxford_ shirt now has a column for _shoeSize_ which doesn’t really make much sense. We could also theoretically pair a _White Oxford_ shirt with a _Grey Wool_ sock. Let’s split our table up into smaller tables for each kind of clothing.

::table{src="wardrobe/05-socks" title="Socks"}

::table{src="wardrobe/05-trousers" title="Trousers"}

::table{src="wardrobe/05-shirts" title="Shirts"}

_I’ve only displayed socks, trousers and shirts here to save some space_.

::figure{slug="bn-01-f5" caption="“What it is” stopped being a property and became the name on the box — and id, name, colour now appear six times."}

Our UML diagram is now split into 6 different types of objects, each with its own properties. Additionally now only socks have the _pairedWith_ relationship rather than all of the garments which makes much more sense.

We now have a pretty solid set of tables for organising the information about our data. But let’s go back to our question “How many white pieces of clothing do I have?”, by trying to better organise our information we have now forced ourselves to look across 6 different tables to answer that question.

Have a look at the different table kinds and what information they hold.

::table{src="wardrobe/06a-grid" title="Which kinds have which facts" sort="none"}

We quickly notice that all of our tables have an _id_, _name_ and _colour_ column. So we can create a new _garments_ table to contain all of that information while keeping our tables for each “kinds” specific information.

::table{src="wardrobe/11-garments" title="Every garment"}

::table{src="wardrobe/11-trousers" title="Trousers (what they add)"}

::table{src="wardrobe/11-socks" title="Socks (what they add)"}

Now we can still sort all of our garments by colour and still have all of the information specific information about each type of garment in separate tables. We use the IDs in both tables to be able to cross reference between the tables.

::figure{slug="bn-01-f6" caption="The triangle points at what it is a kind of."}

This is now what our UML diagram looks like. You can see the arrows pointing from the _subtypes_ of each clothing type to the _super-type_ of _garment_. All trousers have a _waist_ and _leg_ measurement but also have an _id_, _name_ and _colour_ because they are also a _garment_, similarly with all of the other types of garments. In the software world we call this inheritance, a subtype of an object _inherits_ the properties of the super-type. You may notice that the tables contain _id_ on the _subtypes._ This is because the table format needs a way to connect the two stores of information whereas the diagram encodes how they are related by drawing a line between them.

We now have an information model of your clothes, it’s a systematised way of representing what our clothes are. This is only half of the story in our clothes organising system. We still don’t know where anything is!

Understanding where things are is actually really easy now that we have all our clothing information organised. First of all we need to have a list of where all of our things could be. Let’s create a new _places_ table.

::table{src="wardrobe/07-places" title="Places"}

All it is is a list of places that your clothes could be with IDs. This is just represented as a new object type _Place_ in the UML diagram. Notice that it is isolated from the other object types because it currently has no relationships with any other objects and does not inherit properties from anything else.

::figure{slug="bn-01-f7" caption="The wardrobe, the chair, the floor and the basket are things too."}

Now to add the information about where everything is, this will create a relationship between _Places_ and _Garment_ object types. All we have to do is add an _isIn_ relationship between Garment and Place. By adding the relationship between garments and places rather than each individual subtype the diagram stays simple, but because of inheritance all of the subtypes still have the same relationship with _Place_ as _Garment._

::figure{slug="bn-01-f8" caption="Where is it? A connection between two different kinds. 0..\* means “any number”."}

For the _isIn_ relationship, the cardinality on this one is slightly more complicated because the constraint is different on each side of the relationship. A _Garment_ can only be in 0 or 1 places (you either know where it is or don’t) it can’t be in multiple places at once. A _Place_ can contain 0..\* _Garments_, it can contain 0 but in our simplified model it does not have a hard limit on the number of clothes it can contain so the asterisk here means many or unlimited.

This updates our table of garments to look like the below, we now have an _isIn_ column which lets us know where everything is. You can see the _g36 Black sock_ does not have a location meaning that we have lost it. We can find its pair _g35 Black sock_ and throw that one away as well, no more odd socks.

::table{src="wardrobe/12-garments-isin" title="Every garment, and where it is"}

We now know what all our clothes are and where they are. Finally we wanted to know which ones are clean and which ones aren’t. You can probably work out how we will do this already.

All we need to do is add a _clean_ property on garments which gives it to all our different types of clothes because they inherit all of the properties of garment.

::figure{slug="bn-01-f9" caption="Is it clean? A property"}

::table{src="wardrobe/12-garments-isin-clean" title="Every garment, where it is, and whether it's clean"}

One final thing we can do is go back to our table of what _objects_ have each _property_ and see that _Garment_ and _Place_ have some overlap. This points to a real issue. We currently have two identification systems to maintain, that’s an overhead we can get rid of.

::table{src="wardrobe/13a-grid" title="Which kinds have which facts, again" sort="none"}

Using the inheritance that we learnt about earlier we can create a _Thing_ object, it’s a catch all for any object that exists in our information world. _Garment_ and _Place_ both inherit from it which means they both get _id_ and _name_.

::figure{slug="bn-01-f10" caption="One identification system"}

In the table below the _g_ and _p_ prefixes on IDs are for your understanding. A real system doesn’t use them, the only thing an _id_ has to be is unique across every _Thing_. In real systems the ids are long random strings and carry no information at all. We now have a single store for all of our identifiers and their names.

::table{src="wardrobe/13-things" title="Every thing"}

Finally we are done: _things_ are the boxes, _properties of those objects_ are inside them, their _relationships_ are the lines.

This is an interesting exercise but why did we do this?

Information models are how engineers model systems. They act as a way to organise information so that it can be stored and updated in a robust way. It’s much easier to update and find values in a system like this than our original big long list. The model has constrains (cardinality) which allows us to validate information against the model.

There are two other key benefits which I will dive deeper into in the future however there is some early thinking below.

## Semantic Understanding

Once you have built an information model there is a lot of semantic information that is encoded into it, we have a model of clothes, the properties they have the relationships they have with each other and the places they are stored. We have information about the current state of them (if they are clean). A high level view of all of this information can be encoded in a single UML diagram.

This makes it easier for humans to make sense of the data rather than just looking at some tables or lists and trying to understand it from there. What is easier for a human to understand is also generally easier for an AI Agent to understand as well.

For this wardrobe problem it would be quite easy for an AI to grab the list and try and make sense of it. However, this is a very simple system in comparison to many systems. Most systems will have hundreds of object types, thousands of properties on those objects and hundreds of relationships between the objects. In those systems, the only real way to understand them is building information models around the data to give anyone interacting with them an understanding of what is going on.

## Standardisation

Once we have built an information model of your wardrobe you can share the shape of it with your friend. They can get all of their information into the same shape as yours and now you both have a shared understanding of each other’s clothes. This means you can start doing clothes swaps or sharing your clothes, all being tracked through the same system. You know where your friend’s clothes are and if they are clean without having to ask your friend about it.

There are real world systems that are built on information models just like this one. Some are called Common Information Models (common coming from the fact that they are shared across a set of people/companies).

[General Bikeshare Feed Specification](https://gbfs.org/) - An information model that allows any bike sharing company to share information about bike availability with the public in exactly the same way as all other companies.

::figure{slug="bn-01-f11" caption="Simplified GBFS (bike share), four of its kinds."}

[Long Term Development Statement](https://www.ofgem.gov.uk/decision/long-term-development-statement-direction) - An information model the UK government mandates energy grid companies publish about their assets so that other people can use them for planning.

::figure{slug="bn-01-f12" caption="LTDS (IEC CIM), ten of its 193 kinds, intermediate classes omitted. “Thing” in our system is called IdentifiedObject; id is called mRID."}

## In summary

We have built an information model of your wardrobe and understood a couple of use cases for information models. I’ll be exploring more about information models in some upcoming posts. Mostly focused on the energy sector’s use of them to share models, the history of them and how they are now driving innovation in the sector. Thanks for reading!

_All content in this publication is written by a human, agents are used for generating diagrams and synthesising data._

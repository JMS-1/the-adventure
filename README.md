# Nostalgie: ein paar SEHR ALTE und SEHR SPEZIFISCHE Text-Adventures [WiP]

Die Fortsetzung von https://www.psimarron.net/Projects/ADV/backgrounder.htm.

## Der Schrei des Monsters

Dieses erste der drei Text-Adventures ist als Geschenk eines wohlgeschätzten Kollegen vom Physikalischen Institut der Universität Bonn und einem guten Freund entstanden. Ein bißchen als ein besonderes Hochzeitsgeschenk aber auch ein wenig zum Abschied in den nächsten Schritt seines beruflich Werdegangs in die USA.

Eigentlich geht es in diesem Spiel mehr darum, noch einmal das Institut und die Umgebung zu erkunden und alte Bekannte wieder zu treffen. Tatsächlich kann man daraus auch als Gewinner hervorgehen - auch wenn es nicht wirklich etwas zu gewinnen gibt. Dazu braucht es aber eine ganze Menge sehr spezielles Wissen um die Eigenheiten der im Spiel vorkommenden Personen - ich glaueb kaum, dass jemand außerhalb unsere speziellen Gruppe weiß wer gemeint ist wenn jemand spezielles diesen als _Magnetschrat_ referenziert. Auch wenn durchaus etwas drumherum dazu kommt und es eine ganze Reihe versteckter Hinweis gibt kann ich mir kaum vorstellen, dass ein Außenstehender alle kleinen Rätsel löst.

Ich habe dieses Adventure jetzt noch einmal durchgespielt um alle Fehler in der Spiele-Engine zu beseitigen - toi toi toi. Einfach ist es nicht, aber ich denke durchaus für einige Schmunzler gut. Von Anfang wurde zu recht die krude Erkennung von Texteingaben bemängelt - dem ich damals und auch heute noch zustimme. Aber das war halt nicht der Schwerpunkt und ich glaube, dass ich mit einer Handvoll von Befehlen durchgekommen bin - ok, der Magnetschrat war etwas tricky. Die Hilfe sagt nicht viel gibt aber vielleicht doch einige Unterstützung.

## Die technische Historie

Die erste Version entstand für den Commodore AMIGA in C, später erfolgte eine C++ Portierung auf Windows und schließlich eine C# Variante - deren CLI Version tatsächlich auch mit wenigen Anpassungen unter .NET Core 9 läuft. Allen diesen Versionen ist gemeinsam, dass das Adventure selbst in einer kompilierten Binärdatei vorliegt und die Spiele-Engine diese interpretierte. Für verschiedene Personen wurden verschiedenen Dateien mit einer Art Seriennummer erstellt - so als Personal Touch. Insbesondere waren Cheats so eigentlich unterbunden - oder nur mit sehr hohem Aufwand verbunden.

Die aktuelle Version geht einen anderen Weg. Hier im GIT ist der Quellcode des Adventures offen einsehbar - wer sich den Spaß verderben will, kann das gerne tun. Die aktuelle Portierung geht sogar noch weiter: es handelt sich um eine mit dem Angular 19 Framework erstellte Web Anwendungen, die beim Starten des Adventures den Quellcode liest und dann ohne die Zwischenstufe einer binären Datei interpretiert. Dadurch ist auch dieser Quellcode in der [Online](https://saphir.psimarron.net) Version frei verfügbar - das schert aber nicht wirklich.

Der Code für den Parser der Quelldaten und die Spiele-Engine wurde ganz neu in TypeScript erstellt wobei sich natürlich auch Fehler eingschlichen haben können. Zumindest für dieses erste Adventure denke ich sie alle heraus bekommen zu haben, aber wer weiß. Einem kleinen Fehler gehe ich vielleicht noch nach: bei der ersten Begegnung mit dem Monster (hey, das ist kein Spoiler, so heißt das Adventure ja) erscheint dessen Beschreibung zweimal.

## Die Rache des Monsters

Im ersten Adventure gab es so knapp 150 Räume, die man besuchen kann. Das zweite hat über 400 und spielt nun nicht mehr im Institut sondern an einem beliebten Freizeitort unseres damaligen Teams. Ich weiß nicht, ob ich es schaffe auch dieses zu verifizieren, daher ist der Startbutton in der Anwendung auch ausgegraut - betreten auf eigene Gefahr.

## The Babylon Project

Das dritte Text-Adventure schließlich beschreibt einen Besuch auf der Raumstation Babylon 5 aus der gleichnamigen Science Fiction Serie - es ist in Englisch gehalten und hat keinerlei Bezug zu den anderen Adventures. Es ist entstanden, als ich mit einem kleinen Kreis des Fandoms in Kontakt kam. Auch dieses ist in der App ausgegraut und hier glaube ich noch weniger daran, dass ich es durchtesten kann.

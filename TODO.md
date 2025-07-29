Faire step by step pour s'assurer que ça marche:
- S'assurer que je comprenne et simplifie tout le flow depuis un entry points. Je dois maitriser l'ensemble du flow (cursor à fait beaucoup d'overcomplexity inutile et n'a pas bien respecté la simplicité et le rôle de chaque layer)
- Commencer à écrire les tests.
    Voir avec chatGPT/Cursor la meilleur stratégie et plan à mettre en place
    Changer du code (le rendre plus modulable par exemple) s'il ne permet pas un bon testing.
    Le code et fonctions doivent être les plus modulaire possible. Les tests doivent commencer par les plus petites fonctions (utils) juqu'au plus haut niveau (hooks) et ensuite l'UI.
    Il faut évaluer à quoi sert une fonction / fichier et être sur que c'est assez modulaire.
    Voir avec chatGPT pour les autres bonnes pratiques

Settings:
- Faire les pages de settings (ou les enregistrer? persistent?)
- S'assurer du CRUD user
- Changement de mot de passe
- Changement d'email



Ensuite
- Implémenter les tests (s'inspirer de l'ancienne stratégie, le faire vraiment petit à petit)
- Commencer la partie popover
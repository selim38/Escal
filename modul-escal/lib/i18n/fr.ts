/**
 * Dictionnaire français — langue de référence.
 *
 * Le type `Messages` est dérivé de ce fichier : toute clé ajoutée ici devient
 * obligatoire dans les autres langues. Les chaînes acceptent une interpolation
 * `{clé}` résolue par `interpolate()` / `t()`.
 *
 * Volontairement sans `as const` : les valeurs doivent être typées `string` pour
 * qu'un autre dictionnaire soit assignable à `Messages`.
 */
export const fr = {
  app: {
    /** Texte alternatif du logo — porte le nom de marque pour les lecteurs d'écran. */
    logoAlt: "Kit Rénovation Escalier",
    /** Accroche en capitales au-dessus du titre — composant Eyebrow.
     *  Reprend le vocabulaire du site (« Devis gratuit », « Mon devis gratuit »). */
    eyebrow: "Devis gratuit",
    title: "Configurateur de devis",
    intro:
      "Estimation matériaux pour la rénovation de votre escalier. Aucun paiement en ligne — votre demande est transmise à un commercial.",
    supportEmail: "contact@escal-concept.fr",
    /**
     * Bandeau de réassurance sous l'accroche, calqué sur la rangée
     * « Simplicité · Sur mesure · Outils inclus » du site.
     */
    reassurance: [
      "Estimation immédiate",
      "Sans engagement",
      "Réponse sous 24 h",
    ],
  },

  nav: {
    previous: "Précédent",
    next: "Suivant",
    submit: "Envoyer ma demande au commercial",
    submitting: "Envoi en cours…",
  },

  progress: {
    stepOf: "Étape {current} sur {total}",
    label: "Progression du configurateur",
    announce: "Étape {current} sur {total} : {name}",
    /** Ordre calé sur STEP_NAMES de lib/analytics.ts. */
    stepLabels: [
      "Type d'escalier",
      "Décor",
      "Contremarches",
      "Nombre de marches",
      "Dimensions",
      "Embouts de marche",
      "Palier intermédiaire",
      "Parquet",
      "Éléments inclus",
      "Coordonnées",
    ],
  },

  common: {
    close: "Fermer",
    understood: "J'ai compris",
    yes: "Oui",
    no: "Non",
    back: "Retour",
    edit: "Modifier",
    choose: "Choisir…",
    optionalMm: "(optionnel, mm)",
    mm: "mm",
    contactSupport: "Contacter le support",
    unknownError: "Erreur inconnue",
    serverError: "Erreur serveur",
  },

  sample: {
    cta: "Demander un échantillon",
    subject: "Demande d'échantillon — Kit Rénovation Escalier",
    bodyWithDecor:
      "Bonjour,\n\nJe souhaite recevoir un échantillon du décor suivant : {decor}.\n\nMes coordonnées :\nNom :\nAdresse postale :\nTéléphone :\n\nMerci.",
    bodyWithoutDecor:
      "Bonjour,\n\nJe souhaite recevoir un échantillon de vos décors.\n\nMes coordonnées :\nNom :\nAdresse postale :\nTéléphone :\n\nMerci.",
    unavailable:
      "Le CTA échantillon est activé mais aucun destinataire n'est configuré (attribut recipient-email).",
  },

  success: {
    title: "Demande envoyée !",
    reference: "Votre référence :",
    estimate: "Estimation matériaux :",
    followUp:
      "Notre équipe vous contactera sous 24 h pour finaliser votre devis.",
  },

  depthModal: {
    title: "Profondeur hors catalogue",
    body1:
      "Les marches avec une profondeur supérieure à {max} mm dépassent les dimensions standard de notre catalogue.",
    body2:
      "Pour une configuration sur-mesure, veuillez contacter notre support technique directement.",
    fix: "Corriger la valeur",
  },

  m2Modal: {
    title: "Conseil pour les m²",
    body1:
      "Nous vous conseillons de prévoir +20 % par rapport à la surface mesurée, afin de couvrir les pertes liées aux coupes et chutes.",
    body2: "Exemple : pour un palier de 2 m², commandez 2,4 m².",
  },

  // ─────────────────────────── Catalogues ───────────────────────────
  // Libellés indexés par identifiant métier. Les fichiers `lib/*-catalog.ts`
  // ne portent plus que les données (prix, chemins d'images, slugs).

  catalog: {
    decor: {
      CHENE_NATUREL: "Chêne Naturel",
      CHENE_VINTAGE: "Chêne Vintage",
      CHENE_VINTAGE_GRIS: "Chêne Vintage Gris",
      CHENE_CERUSE: "Chêne Cérusé",
      NOYER: "Noyer",
      NOYER_BLANC: "Noyer Blanc",
      HETRE: "Hêtre",
      PIN_RUSTIQUE: "Pin Rustique",
      GRIS_MINERAL: "Gris Minéral",
      PIERRE_ANTHRACITE: "Pierre Anthracite",
      PIERRE_BETON_GRIS: "Pierre Béton Gris",
    },

    riser: {
      NONE: {
        label: "Sans contremarche",
        description: "Marches seules, sans habillage de contremarche.",
      },
      DECOR: {
        label: "Couleur du décor",
        description: "Finition assortie au décor choisi.",
      },
      BLACK_MATTE: {
        label: "Noir mat",
        description: "Finition noire mate, quel que soit le format.",
      },
      WHITE_MATTE: {
        label: "Blanc mat",
        description: "Finition blanche mate, quel que soit le format.",
      },
    },

    layout: {
      STRAIGHT: {
        label: "Droite",
        description: "Marche droite, sans changement de direction.",
      },
      BALANCED: {
        label: "Tournante",
        description: "Marche tournante (palier ou retour d'angle).",
      },
      FIVE_SIDED: {
        label: "5 côtés",
        description: "Marche à 5 côtés : longueur max. et profondeur max.",
      },
    },

    endCap: {
      NONE: { label: "Sans", description: "Pas d’embout de marche." },
      OPEN_STEP: {
        label: "Pour marche ouverte",
        description: "Embout en 1 pièce — côtés ouverts.",
      },
      OVERHANGING: {
        label: "Pour marche débordante",
        description: "Embout en 2 pièces — nez débordant.",
      },
    },

    endSide: {
      LEFT: "Gauche",
      RIGHT: "Droite",
    },

    width: {
      W_LT_800: "< 800 mm",
      W_801_1000: "801 – 1000 mm",
      W_1001_1300: "1001 – 1300 mm",
      W_1301_1600: "1301 – 1600 mm",
      W_1601_1800: "1601 – 1800 mm",
    },

    depth: {
      D_LT_320: "< 320 mm",
      D_GT_320: "> 320 mm",
    },

    landingFinish: {
      NONE: "Sans palier",
      NEZ_SEUIL: "Nez + seuil",
      NEZ_RACCORD_PARQUET: "Nez de raccord parquet",
    },

    seuilColor: {
      OR: "Or",
      NOIR: "Noir",
      ALUMINIUM: "Aluminium",
    },

    dimensionField: {
      widthBand: "Longueur",
      depthBand: "Profondeur",
    },

  },

  // ─────────────────────────── Étapes ───────────────────────────

  steps: {
    staircaseType: {
      title: "Type d'escalier",
      subtitle: "Votre escalier est-il ouvert ou fermé entre chaque marche ?",
      closed: {
        label: "Fermé",
        description: "Mon escalier est fermé entre chaque marche.",
      },
      open: {
        label: "Ouvert",
        description: "Mon escalier est ouvert entre chaque marche.",
      },
      openWarningTitle: "Cas spécifique — escalier ouvert",
      openWarningBody:
        "Les escaliers ouverts entre chaque marche nécessitent une étude sur mesure. Notre équipe vous contactera pour affiner la configuration.",
    },

    decor: {
      title: "Choisir le décor",
    },

    riser: {
      title: "Contremarches",
      subtitle: "Choisir le décor des contremarches :",
      included: "Inclus",
      pricePerStep: "+{price} € / marche",
      heightLabel: "Hauteur des contremarches",
      heightOptional: "(optionnel, mm)",
      heightPlaceholder: "Ex. 175",
    },

    stepCount: {
      title: "Nombre de marches",
      subtitle:
        "Comptez les marches de bas en haut, marche terminale du palier incluse.",
      exampleBadge: "Exemple",
      exampleAlt:
        "Exemple : marches numérotées de bas en haut, marche de palier incluse",
      exampleCaption: "Exemple — ici 7 marches (marche de palier incluse).",
      inputLabel: "Nombre de marches",
      inputPlaceholder: "Ex. 12",
    },

    dimensions: {
      title: "Dimensions des marches",
      question:
        "Toutes vos marches ont-elles les mêmes dimensions (profondeur et longueur) ?",
      uniformYes: {
        label: "Oui",
        description:
          "Toutes les marches ont la même profondeur et la même longueur.",
      },
      uniformNo: {
        label: "Non",
        description:
          "Les marches ont des dimensions différentes (profondeur ou longueur variables).",
      },
      bandsIntro: "Indiquez les fourchettes de mesure de vos marches.",
      bandsTolerance:
        "Tolérance de 1 cm pour la longueur et de 1 cm pour la profondeur.",
      lengthLabel: "Longueur",
      depthLabel: "Profondeur",
      exactDepthLabel: "Profondeur exacte",
      exactDepthPlaceholder: "ex. 280",
      photoAlt: "{field} — marche {layout}",
      layoutSlug: {
        STRAIGHT: "droite",
        BALANCED: "tournante",
        FIVE_SIDED: "cercueil",
      },
    },

    perStep: {
      intro: "Configurez chaque marche individuellement",
      hint: "Type, longueur et profondeur — les photos indiquent les mesures demandées.",
      stepAria: "Marche {index}",
      previous: "Précédente",
      next: "Suivante",
      counter: "Marche {index} / {total}",
      layoutLabel: "Type de marche",
      lengthBalanced: "Longueur (la + longue)",
      lengthFiveSided: "Longueur max.",
      depthFiveSided: "Profondeur max.",
    },

    endCap: {
      title: "Embout de marche",
      subtitle: "Nous allons configurer chaque marche de bas en haut.",
      stepLabel: "Marche {index}",
      progress: "Marche {index} sur {total}",
      askBetween2Walls:
        "Votre marche {index} est-elle prise entre 2 murs ?",
      askCapType: "Comment est cette marche côté ouvert ?",
      capOverhanging: "Marche débordante",
      capOpenStep: "Ouverte sur le côté",
      askSide: "De quel côté est-elle ouverte ?",
      askSideHint: "(vu du bas de l'escalier)",
      summaryBetween2Walls: "Entre 2 murs",
      summaryOverhanging: "Débordante",
      summaryOpenLeft: "Ouverte — gauche",
      summaryOpenRight: "Ouverte — droite",
      summaryNone: "—",
      allDone: "Toutes les marches sont configurées.",
    },

    landing: {
      title: "Marche palière",
      subtitle: "Choisissez le type de finition pour votre marche palière.",
      nezSeuil: {
        label: "Nez + seuil",
        description: "Nez de marche avec seuil décoratif pour finir le palier.",
        note: "À choisir si vous ne prenez pas le parquet chez nous.",
      },
      nezRaccordParquet: {
        label: "Nez de raccord parquet",
        description: "Nez de raccord fourni avec votre commande de parquet.",
        note: "Inclus automatiquement si vous prenez le parquet chez nous.",
      },
      seuilColorLabel: "Couleur du seuil",
    },

    parquet: {
      title: "Parquet du palier",
      subtitle:
        "Précisez la surface de votre palier. La teinte du parquet sera assortie à votre décor.",
      areaLabel: "Surface du palier (m²)",
      areaPlaceholder: "ex. 2.4",
      areaUnit: "m²",
      plus20: "+20 % recommandé",
      underlayIncluded: "Fourni avec sous-couche incluse",
      plinthesQuestion: "Souhaitez-vous des plinthes 60 mm assorties ?",
      plinthesHint: "Teinte assortie au décor sélectionné.",
      plinthesLabel: "Longueur de plinthes (ml)",
      plinthesPlaceholder: "ex. 6.0",
      plinthesUnit: "ml",
    },

    included: {
      title: "Récapitulatif de votre offre",
      subtitle: "Vérifiez votre configuration avant de passer à l'étape finale.",
      configTitle: "Votre configuration",
      rowSteps: "Marches",
      valueSteps: "{count} marche{plural}",
      rowDecor: "Décor",
      rowRiser: "Contremarches",
      rowEndCaps: "Embouts de marche",
      rowLandingFinish: "Finition marche palière",
      rowConsumables: "Consommables",
      valueConsumables:
        "{count} tube{plural} de colle · 1 tube de silicone",
      endCapOverhanging: "{count} débordante{plural}",
      endCapOpen: "{count} ouverte{plural}",
      endCapNone: "Sans embout",
      materialsTitle: "Matériel inclus",
      priceIncluded: "Compris dans le prix",
      materialsNote:
        "Des photos détaillées du contenu du kit seront ajoutées prochainement.",
      materials: [
        "Patron de mesure",
        "Crayon de marquage",
        "Règles de pose",
        "Stiro de calage",
        "Cales silicone",
        "Tasseaux de calage",
        "Visserie & fixations",
        "Emballage protection",
      ],
      tutorialsTitle: "Tutoriels de montage en vidéo",
      tutorialsBody:
        "L'ensemble des tutoriels de montage sous forme de vidéo est inclus dans votre commande — prise de mesures, découpe, pose, finitions.",
      priceLabel: "Prix estimé des matériaux",
      priceUnavailable:
        "Complétez les étapes précédentes pour afficher l'estimation.",
      priceNote: "Estimation matériaux uniquement, hors pose et livraison.",
      nextCtaStrong: "Pour finaliser votre devis,",
      nextCtaBody:
        "renseignez vos coordonnées et ajoutez 3 photos de votre escalier à l'étape suivante. Un technicien vous recontactera rapidement.",
      nextCtaLink: "Étape suivante : coordonnées & photos",
    },

    lead: {
      title: "Vos coordonnées",
      subtitle: "Un technicien vous recontactera pour finaliser votre devis.",
      personalInfo: "Informations personnelles",
      lastName: "Nom",
      firstName: "Prénom",
      email: "E-mail",
      phone: "Téléphone",
      country: "Pays",
      countryPlaceholder: "Sélectionnez un pays…",
      countryMain: "Principaux",
      countryOther: "Autres",
      contactPreferenceTitle: "Comment souhaitez-vous être contacté ?",
      contactWhatsapp: "WhatsApp",
      contactEmail: "E-mail",
      contactHint:
        "Si vous n'avez pas WhatsApp, choisissez E-mail — un technicien vous répondra dans les 24 h.",
      photosTitle: "Photos de votre escalier",
      photosIntro:
        "3 photos sont nécessaires pour que notre technicien puisse affiner votre devis.",
      photosNote:
        "Les photos sont facultatives mais fortement recommandées pour obtenir un devis précis.",
      addPhoto: "Ajouter une photo",
      removePhoto: "Supprimer {label}",
      photoSlots: {
        bas: {
          label: "Vue du bas",
          hint: "Depuis le rez-de-chaussée, en regardant vers le haut.",
        },
        milieu: {
          label: "Vue du milieu",
          hint: "Depuis le milieu de l'escalier.",
        },
        haut: {
          label: "Vue du haut",
          hint: "Depuis le palier supérieur, en regardant vers le bas.",
        },
      },
      countries: {
        main: ["France", "Belgique", "Suisse", "Luxembourg", "Canada"],
        other: [
          "Allemagne",
          "Espagne",
          "Italie",
          "Pays-Bas",
          "Portugal",
          "Royaume-Uni",
          "Maroc",
          "Tunisie",
          "Algérie",
          "Autre",
        ],
      },
    },
  },

  // ─────────────────────── Messages de validation ───────────────────────
  // Les schémas zod émettent les clés `validation.<nom>` ; `resolveMessage()`
  // les traduit à l'affichage. Une chaîne inconnue est rendue telle quelle.

  validation: {
    chooseStepLayout: "Choisissez un type de marche.",
    selectWidth: "Sélectionnez une largeur.",
    selectDepth: "Sélectionnez une profondeur.",
    staircaseTypeRequired: "Indiquez le type d'escalier.",
    decorRequired: "Sélectionnez un décor.",
    riserOptionRequired: "Choisissez une finition de contremarche.",
    riserHeightRequired: "Indiquez la hauteur des contremarches.",
    integerRequired: "Nombre entier requis.",
    riserHeightMin: "Minimum 100 mm.",
    riserHeightMax: "Maximum 300 mm.",
    stepCountRequired: "Indiquez le nombre de marches.",
    stepCountMin: "Minimum 1 marche.",
    stepCountMax: "Maximum 30 marches.",
    uniformRequired:
      "Indiquez si toutes les marches ont les mêmes dimensions.",
    landingFinishRequired: "Choisissez un type de marche palière.",
    seuilColorRequired: "Choisissez la couleur du seuil.",
    endCapRequired: "Choisissez un type d’embout de marche.",
    endCapConfigsIncomplete: "Configurez toutes les marches.",
    stepConfigsIncomplete:
      "Configurez le type et les dimensions de chaque marche.",
    firstNameRequired: "Le prénom est obligatoire.",
    lastNameRequired: "Le nom est obligatoire.",
    emailInvalid: "E-mail invalide.",
    phoneRequired: "Le téléphone est obligatoire.",
    countryRequired: "Le pays est obligatoire.",
    answerRequired: "Réponse requise.",
  },
};

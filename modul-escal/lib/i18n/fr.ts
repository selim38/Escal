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

/**
 * Ce que couvre le prix affiché — récapitulatif et écran de confirmation.
 * Formule Knewledge : « estimation matériaux » laissait croire les outils et
 * consommables en supplément.
 */
const priceScope = "Prix pour les marches, contremarches, outils et consommables";

export const fr = {
  app: {
    /** Texte alternatif du logo — porte le nom de marque pour les lecteurs d'écran. */
    logoAlt: "Kit Rénovation Escalier",
    // Titre, accroche et réassurance ne sont plus portés par le composant :
    // recommandation Knewledge, ils vivent dans la page WordPress qui l'accueille.
    supportEmail: "contact@kitrenovationescalier.fr",
  },

  nav: {
    previous: "Précédent",
    next: "Suivant",
    submit: "Envoyer ma demande au commercial",
    /** Libellé court du même bouton sur mobile, où il partage la ligne avec « Précédent ». */
    submitShort: "Envoyer",
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
      "Éléments inclus",
      "Photos et coordonnées",
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
    optional: "(optionnel)",
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
    /** Titre en deux graisses (design system) : le dernier mot est mis en avant. */
    titleStart: "Votre demande a bien été",
    titleEmphasis: "envoyée",
    reference: "Votre référence :",
    estimate: `${priceScope} :`,
    estimateNote: "(hors livraison)",
    followUp:
      "Notre équipe vous contactera sous 24 h pour finaliser votre devis.",
  },

  /** Rappel aux étapes Dimensions et Embouts (voir LandingStepNote). */
  landingStep: {
    note: "La marche {index}, votre marche palière, n'est pas à configurer : c'est un seuil avec nez de marche, d'un seul morceau.",
  },

  depthModal: {
    title: "Profondeur hors catalogue",
    body1:
      "Les marches avec une profondeur supérieure à {max} mm dépassent les dimensions standard de notre catalogue.",
    body2:
      "Pour une configuration sur-mesure, veuillez contacter notre support technique directement.",
    fix: "Corriger la valeur",
  },


  measureHintModal: {
    title: "Comment mesurer cette marche",
    widthBody: "Prenez la longueur la plus longue de la marche.",
    depthBody: "Prenez la profondeur la plus longue de la marche.",
    help: "Les photos à côté du formulaire indiquent la mesure attendue.",
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
      subtitle:
        "Le kit s'adresse aux escaliers fermés entre chaque marche.",
      closed: {
        label: "Fermé",
        description: "Mon escalier est fermé entre chaque marche.",
      },
      otherTitle: "Votre escalier est d'un autre type ?",
      otherBody:
        "Laissez-nous vos coordonnées : notre équipe vous contactera pour étudier votre projet.",
      otherCta: "Être recontacté",
      /** Repli `mailto:` quand aucun formulaire n'est configuré (attribut `open-staircase-url`). */
      otherContactSubject: "Autre type d'escalier — demande de contact",
      otherContactBody:
        "Bonjour,\n\nMon escalier n'est pas fermé entre chaque marche et je souhaite être recontacté.\n\nMes coordonnées :\nNom :\nTéléphone :\nVille :\n\nMerci.",
    },

    decor: {
      title: "Choisir le décor",
      subtitle:
        "Le décor s'applique aux marches et, si vous le souhaitez, aux contremarches.",
    },

    riser: {
      title: "Contremarches",
      subtitle: "Choisir le décor des contremarches :",
      included: "Inclus",
      pricePerStep: "+{price} € / marche",
      heightLabel: "Hauteur des contremarches",
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
      rangeHint: "Entre {min} et {max} marches.",
      landingTitle: "La dernière marche est la marche palière.",
      landingBody:
        "Ce n'est pas une marche complète, mais un seuil avec nez de marche d'un seul morceau : vous n'aurez pas à la configurer.",
      decrease: "Retirer une marche",
      increase: "Ajouter une marche",
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
      exactDepthPlaceholder: "Ex. 350",
      /**
       * Champ affiché pour la seule fourchette « > 320 mm » : il détecte une
       * profondeur hors catalogue (voir DepthBlockedModal).
       */
      exactDepthHelp:
        "Entre {min} et {max} mm. Au-delà de {max} mm, vos marches sortent de notre catalogue et demandent une étude sur mesure.",
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
      // « Marche » précisé pour ne pas confondre avec la navigation entre étapes.
      previous: "Marche précédente",
      next: "Marche suivante",
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
      capBetween2Stringers: "Prise entre deux limons",
      capOverhanging: "Marche débordante",
      capOpenStep: "Ouverte sur le côté",
      photoAltBetween2Stringers:
        "Escalier dont les marches sont prises entre deux limons",
      photoAltOverhanging: "Marche débordante en bas d'un escalier",
      photoAltOpenStep: "Marche ouverte sur le côté",
      askSide: "De quel côté est-elle ouverte ?",
      askSideHint: "(vu du bas de l'escalier)",
      summaryBetween2Walls: "Entre 2 murs",
      summaryBetween2Stringers: "Entre 2 limons",
      summaryOverhanging: "Débordante",
      summaryOpenLeft: "Ouverte — gauche",
      summaryOpenRight: "Ouverte — droite",
      summaryNone: "—",
      askLanding: "La marche {index} est-elle bien votre marche palière ?",
      askLandingHint: "La marche du haut, au niveau du palier : seuil et nez de marche d'un seul morceau.",
      landingNo:
        "Le nombre de marches doit inclure la marche palière : la marche {index} doit être celle du palier.",
      editStepCount: "Modifier le nombre de marches",
      summaryLanding: "Marche palière — seuil + nez",
      allDone: "Toutes les marches sont configurées.",
      editing: "En cours de modification",
      cancelEdit: "Annuler la modification",
    },

    landing: {
      title: "Marche palière",
      subtitle:
        "Votre marche palière est finie par un nez de marche et un seuil décoratif, qui assurent la jonction propre avec le sol du palier.",
      nezSeuil: {
        label: "Nez + seuil",
        // Seule finition au catalogue : elle est présélectionnée (recommandation Knewledge).
        description:
          "Seule finition proposée, elle est sélectionnée pour vous. Il vous reste à choisir la couleur du seuil.",
      },
      seuilColorLabel: "Couleur du seuil",
      seuilPhotoAlt: "Seuil {color} posé sur une marche palière",
      seuilPhotoAltDecor: "Seuil {color} sur une marche palière {decor}",
    },


    included: {
      title: "Récapitulatif de votre offre",
      subtitle: "Vérifiez votre configuration avant de passer à l'étape finale.",
      configTitle: "Votre configuration",
      // Une ligne par étape, dans l'ordre du tunnel.
      rowStaircaseType: "Type d'escalier",
      rowDecor: "Décor",
      rowRiser: "Contremarches",
      rowSteps: "Nombre de marches",
      valueSteps: "{count} marche{plural} + marche palière",
      rowDimensions: "Dimensions",
      valueDimensionsUniform: "Longueur {width} · profondeur {depth}",
      valueDimensionsPerStep: "Marche par marche : {detail}",
      layoutCount: {
        STRAIGHT: "{count} droite{plural}",
        BALANCED: "{count} tournante{plural}",
        FIVE_SIDED: "{count} à 5 côtés",
      },
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
      materialsNote: "Photos provisoires — les visuels définitifs suivront.",
      materialPhotoAlt: "{item} inclus dans le kit",
      // Même ordre que MATERIAL_PHOTOS dans StepInclus : mesure et marquage,
      // découpe, collage, finition, protection.
      materials: [
        "Mètre 5 m",
        "Règle 30 cm",
        "Feutre effaçable",
        "Rouleau scotch papier",
        "Scie sauteuse",
        "Lames dent inverse (bois)",
        "Lame acier (métal)",
        "Cutter",
        "Cale à poncer 100-120",
        "Dégraissant",
        "Acétone",
        "Colle polyuréthane 300 ml",
        "Pistolet à cartouche",
        "Silicone neutre 300 ml",
        "Spatules à silicone",
        "Produit lissage silicone",
        "Chiffon microfibre",
        "Gants",
      ],
      tutorialsTitle: "Tutoriels de montage en vidéo",
      tutorialsBody:
        "L'ensemble des tutoriels de montage sous forme de vidéo est inclus dans votre commande — prise de mesures, découpe, pose, finitions.",
      tutorialsDevices:
        "Les vidéos sont consultables depuis n'importe quel appareil : smartphone, tablette ou ordinateur.",
      priceLabel: priceScope,
      priceUnavailable:
        "Complétez les étapes précédentes pour afficher l'estimation.",
      priceNote: "(Hors livraison)",
      nextStepsTitle: "Pour finaliser votre commande",
      nextSteps: [
        "Votre devis est complet : vérifiez-le ci-dessus.",
        "Pour éviter toute erreur d'incompatibilité ou technique, joignez 3 photos de votre escalier à l'étape suivante.",
        "Une fois votre dossier validé par nos soins, vous débloquerez les vidéos tutos, le pack installation outillage et le matériel pour le recouvrement de votre escalier, réalisé dans notre usine.",
        "Renseignez vos coordonnées : un expert vous recontactera.",
      ],
    },

    lead: {
      title: "Photos et coordonnées",
      subtitle: "Un expert vous recontactera pour finaliser votre devis.",
      personalInfo: "Informations personnelles",
      personalInfoIntro: "Merci de renseigner vos coordonnées ci-dessous.",
      /** Affiché entre les photos et les coordonnées (ordre fixé par Escal Concept). */
      unlockInfo:
        "Une fois votre dossier validé par nos soins, vous débloquerez les vidéos tutos, le pack installation outillage et le matériel pour le recouvrement de votre escalier, réalisé dans notre usine.",
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
      contactPhone: "Téléphone",
      contactHint:
        "Si vous n'avez pas WhatsApp, choisissez E-mail ou Téléphone — un expert vous répondra dans les 24 h.",
      photosTitle: "Photos de votre escalier",
      photosIntro:
        "Pour éviter toute erreur d'incompatibilité ou technique, joignez 3 photos de votre escalier.",
      photosNote: "Les photos sont obligatoires pour une validation de dossier.",
      photosMissing:
        "Il manque {count} photo{plural} sur {total} pour envoyer votre demande.",
      /** Annoncé après un envoi refusé ; le focus est placé sur le premier champ en cause. */
      errorSummary:
        "Votre demande n'est pas encore complète : corrigez les points signalés en rouge.",
      addPhoto: "Ajouter une photo",
      takePhoto: "Prendre une photo",
      choosePhoto: "Depuis la galerie",
      chooseFile: "Choisir un fichier",
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
    stepCountMin: "Minimum 2 marches, marche palière comprise.",
    stepCountMax: "Maximum 30 marches.",
    uniformRequired:
      "Indiquez si toutes les marches ont les mêmes dimensions.",
    exactDepthRequired: "Indiquez la profondeur exacte de vos marches.",
    exactDepthMin:
      "Minimum 320 mm. En dessous, choisissez la profondeur « < 320 mm ».",
    exactDepthMax: "Maximum 630 mm.",
    landingFinishRequired: "Choisissez un type de marche palière.",
    seuilColorRequired: "Choisissez la couleur du seuil.",
    endCapRequired: "Choisissez un type d’embout de marche.",
    endCapConfigsIncomplete: "Configurez toutes les marches.",
    landingStepUnconfirmed:
      "Indiquez si la dernière marche est bien votre marche palière.",
    stepConfigsIncomplete:
      "Configurez le type et les dimensions de chaque marche.",
    firstNameRequired: "Le prénom est obligatoire.",
    lastNameRequired: "Le nom est obligatoire.",
    emailInvalid: "E-mail invalide.",
    phoneRequired: "Le téléphone est obligatoire.",
    phoneInvalid:
      "Numéro de téléphone invalide : chiffres, espaces et « + » uniquement.",
    countryRequired: "Le pays est obligatoire.",
    answerRequired: "Réponse requise.",
  },
};

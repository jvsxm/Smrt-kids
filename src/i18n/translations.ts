export type AppLanguage = 'en' | 'fr' | 'de' | 'ar';

export const LANGUAGE_OPTIONS: Array<{
  code: AppLanguage;
  label: string;
  shortLabel: string;
}> = [
  { code: 'en', label: 'English', shortLabel: 'EN' },
  { code: 'fr', label: 'Français', shortLabel: 'FR' },
  { code: 'de', label: 'Deutsch', shortLabel: 'DE' },
  { code: 'ar', label: 'العربية', shortLabel: 'AR' },
];

export interface TranslationDict {
  nav: {
    dashboard: string;
    discovery: string;
    recommendations: string;
    favorites: string;
    signIn: string;
    signOut: string;
    languageLabel: string;
  };
  footer: {
    tagline: string;
    catalogDiscovery: string;
    parentDashboard: string;
    childProfiles: string;
    gdprNote: string;
  };
  landing: {
    kicker: string;
    headline: string;
    subtitle: string;
    ctaDashboard: string;
    ctaSignIn: string;
    ctaBrowse: string;
    strip1Kicker: string;
    strip1Title: string;
    strip1Desc: string;
    strip2Kicker: string;
    strip2Title: string;
    strip2Desc: string;
    strip3Kicker: string;
    strip3Title: string;
    strip3Desc: string;
    strip4Kicker: string;
    strip4Title: string;
    strip4Desc: string;
    howTitle: string;
    howSubtitle: string;
    step1Tag: string;
    step1Title: string;
    step1Desc: string;
    step2Tag: string;
    step2Title: string;
    step2Desc: string;
    step3Tag: string;
    step3Title: string;
    step3Desc: string;
    catalogTitle: string;
    catalogSubtitle: string;
    exploreAll: string;
  };
  login: {
    badge: string;
    title: string;
    subtitle: string;
    continueGoogle: string;
    signingIn: string;
    childNotice: string;
    privacyNotice: string;
  };
  dashboard: {
    title: string;
    manageChildren: string;
    editPreferences: string;
    emptyTitle: string;
    emptyDesc: string;
    createProfile: string;
    computedAge: string;
    approvedMatches: string;
    verifiedSafe: string;
    reviewQueue: string;
    reviewDesc: string;
    activeInterests: string;
    genresLabel: string;
    topRecsTitle: string;
    topRecsSubtitle: string;
    refreshScores: string;
    recalculating: string;
    fullReport: string;
    noMatches: string;
    adjustPrefsHint: string;
    adjustPrefs: string;
    details: string;
    discoveryCardTitle: string;
    discoveryCardDesc: string;
    favoritesCardTitle: string;
    favoritesCardDesc: string;
  };
  children: {
    title: string;
    subtitle: string;
    addTitle: string;
    editTitle: string;
    nicknameLabel: string;
    nicknamePlaceholder: string;
    birthDateLabel: string;
    genderLabel: string;
    genderUnspecified: string;
    genderBoy: string;
    genderGirl: string;
    genderOther: string;
    genderHelp: string;
    saveChanges: string;
    createProfile: string;
    saving: string;
    cancel: string;
    noProfiles: string;
    noProfilesHint: string;
    preferencesBtn: string;
    editBtn: string;
    deleteBtn: string;
    confirmDeleteMsg: string;
    confirmDeleteBtn: string;
  };
  preferences: {
    backToChildren: string;
    titlePrefix: string;
    computedAge: string;
    genresTitle: string;
    genresHint: string;
    languagesTitle: string;
    languagesHint: string;
    countryLabel: string;
    maxAgeLabel: string;
    minRatingLabel: string;
    educationalToggle: string;
    educationalHint: string;
    reviewToggle: string;
    reviewHint: string;
    saveBtn: string;
    savingBtn: string;
  };
  discover: {
    title: string;
    subtitle: string;
    syncBtn: string;
    syncingBtn: string;
    tmdbHint: string;
    searchPlaceholder: string;
    all: string;
    tvSeries: string;
    movies: string;
    allGenres: string;
    allLanguages: string;
    verifiedOnly: string;
    showingCount: string;
    titlesLabel: string;
    emptyTitle: string;
    emptyHint: string;
    verifiedBadge: string;
    reviewBadge: string;
  };
  recommendations: {
    title: string;
    subtitle: string;
    adjustPreferences: string;
    recalculate: string;
    recalculating: string;
    approvedTab: string;
    reviewTab: string;
    verifiedSuitable: string;
    reviewRequired: string;
    compatibilityScore: string;
    whyRecommended: string;
    saveFavorite: string;
    savedFavorite: string;
    writeReview: string;
    hideReview: string;
    reviewPlaceholder: string;
    saveReview: string;
    emptyApproved: string;
    emptyReview: string;
  };
  details: {
    backToDiscovery: string;
    playTrailer: string;
    loadingTrailer: string;
    closeTrailer: string;
    officialTrailer: string;
    genresLabel: string;
    audioLanguages: string;
    subtitlesAvailable: string;
    noneListed: string;
    classificationsTitle: string;
    countryCol: string;
    ratingCol: string;
    minAgeCol: string;
    sourceCol: string;
    statusCol: string;
    verified: string;
    unverified: string;
    unknown: string;
    compatibilityFor: string;
    parentRatingFor: string;
    addToFavorites: string;
    savedInFavorites: string;
    reviewLabel: string;
    reviewPlaceholder: string;
    saveFeedbackBtn: string;
    savingBtn: string;
  };
  favorites: {
    title: string;
    subtitle: string;
    emptyTitle: string;
    emptyHint: string;
    viewRecs: string;
    remove: string;
    details: string;
    ratingsHistoryTitle: string;
    ratingsHistorySubtitle: string;
    noRatingsYet: string;
    ratedLabel: string;
  };
}

export const TRANSLATIONS: Record<AppLanguage, TranslationDict> = {
  en: {
    nav: {
      dashboard: 'Dashboard',
      discovery: 'Discovery',
      recommendations: 'Recommendations',
      favorites: 'Favorites',
      signIn: 'Sign In',
      signOut: 'Sign Out',
      languageLabel: 'Language',
    },
    footer: {
      tagline:
        'Parent-controlled cartoon discovery with verified regional age classifications and transparent compatibility scoring.',
      catalogDiscovery: 'Catalog Discovery',
      parentDashboard: 'Parent Dashboard',
      childProfiles: 'Child Profiles',
      gdprNote: 'EU GDPR Minimal-Data Design',
    },
    landing: {
      kicker: 'Parent-Controlled Cartoon Discovery',
      headline:
        'Age-verified cartoon recommendations parents can verify at a glance.',
      subtitle:
        "Smart Kids evaluates animated movies and TV series against official regional classifications such as German FSK, matches your child's developmental age and languages, and explains every compatibility score clearly.",
      ctaDashboard: 'Open Parent Dashboard',
      ctaSignIn: 'Sign In as Parent',
      ctaBrowse: 'Browse Verified Catalog',
      strip1Kicker: 'Stage 1 Filter',
      strip1Title: 'Mandatory Safety Gate',
      strip1Desc:
        "Excludes non-animated titles, adult content, and ratings above your child's age.",
      strip2Kicker: 'FSK · MPAA · BBFC',
      strip2Title: 'Regional Normalization',
      strip2Desc:
        'Unverified ratings never auto-approve and route straight to Parental Review.',
      strip3Kicker: '100-Point Rubric',
      strip3Title: 'Explainable Scoring',
      strip3Desc:
        'Every match breaks down age, genres, audio languages, learning value, and feedback.',
      strip4Kicker: 'EU GDPR Conscious',
      strip4Title: 'Parent-Only Accounts',
      strip4Desc:
        'Children need no accounts. Gender is optional and never restricts recommendations.',
      howTitle: 'How the hybrid recommendation engine works',
      howSubtitle:
        'Built around transparent rule-based filtering and weighted compatibility scoring rather than opaque black-box feeds.',
      step1Tag: '01. Child Profile & Dynamic Age',
      step1Title: 'Computed from birth date',
      step1Desc:
        "Parents record only a nickname and birth date so your child's age stays accurate automatically over time. Optional gender never filters or narrows genres.",
      step2Tag: '02. Classification Verification',
      step2Title: 'Country-specific age checks',
      step2Desc:
        'Official certifications from Germany (FSK 0/6/12), the US, France, and the UK are normalized into minimum ages. Missing or unverified ratings wait in Parental Review.',
      step3Tag: '03. 100-Point Weighted Match',
      step3Title: 'Clear reasons for every pick',
      step3Desc:
        'Approved cartoons are scored across Age (40), Genres (25), Languages (20), Educational focus (10), and Parent Feedback (5).',
      catalogTitle: 'Verified family catalog',
      catalogSubtitle:
        'Inspect age classifications, available audio tracks, and learning themes before signing in.',
      exploreAll: 'Explore all cartoons',
    },
    login: {
      badge: 'Parent Access Only',
      title: 'Sign in to Smart Kids',
      subtitle:
        'Manage child profiles, set age-classification rules, inspect recommendation explanations, and save family favorites.',
      continueGoogle: 'Continue with Google',
      signingIn: 'Signing in...',
      childNotice:
        'Children are indirect beneficiaries and never receive login credentials or access to parent configuration.',
      privacyNotice:
        'Your authentication token is verified server-side and all child profile data can be deleted permanently at any time.',
    },
    dashboard: {
      title: 'Parent Dashboard',
      manageChildren: 'Manage Children',
      editPreferences: 'Edit Preferences',
      emptyTitle: 'Start by creating your first child profile',
      emptyDesc:
        'Add a nickname and birth date to compute age automatically, choose favorite genres and languages, and unlock age-verified recommendations.',
      createProfile: 'Create Child Profile',
      computedAge: 'Computed Age',
      approvedMatches: 'Approved Matches',
      verifiedSafe: 'Verified safe classifications',
      reviewQueue: 'Parental Review Queue',
      reviewDesc: 'Unverified or foreign rating',
      activeInterests: 'Active Interests',
      genresLabel: 'genres',
      topRecsTitle: 'Top Recommendations for',
      topRecsSubtitle:
        'Ranked by 100-point compatibility across age, genres, languages, and parent ratings.',
      refreshScores: 'Refresh Scores',
      recalculating: 'Recalculating...',
      fullReport: 'Full Report',
      noMatches: 'No verified recommendations matched current filters.',
      adjustPrefsHint:
        'Try adjusting genre/language preferences or inspect the Parental Review queue.',
      adjustPrefs: 'Adjust Preferences',
      details: 'Details',
      discoveryCardTitle: 'Cartoon Discovery & TMDB Sync',
      discoveryCardDesc:
        'Search all animated titles or sync new releases from TMDB.',
      favoritesCardTitle: 'Saved Family Favorites',
      favoritesCardDesc:
        'Review bookmarked cartoons and past parent ratings for',
    },
    children: {
      title: 'Child Profile Management',
      subtitle:
        'Only a nickname and birth date are required. Age is calculated dynamically on every recommendation check.',
      addTitle: 'Add Child Profile',
      editTitle: 'Edit Child Profile',
      nicknameLabel: 'Child Nickname',
      nicknamePlaceholder: 'e.g. Adam or Lina',
      birthDateLabel: 'Date of Birth',
      genderLabel: 'Gender (Optional)',
      genderUnspecified: 'Prefer not to specify (Recommended)',
      genderBoy: 'Boy',
      genderGirl: 'Girl',
      genderOther: 'Other',
      genderHelp: 'Never used to filter or exclude any cartoon genres.',
      saveChanges: 'Save Changes',
      createProfile: 'Create Profile',
      saving: 'Saving...',
      cancel: 'Cancel',
      noProfiles: 'No child profiles created yet.',
      noProfilesHint: 'Use the form on the left to add your first child profile.',
      preferencesBtn: 'Preferences',
      editBtn: 'Edit',
      deleteBtn: 'Delete',
      confirmDeleteMsg:
        'Permanently delete this profile, preferences, favorites, and ratings?',
      confirmDeleteBtn: 'Confirm Delete',
    },
    preferences: {
      backToChildren: 'Back to Child Profiles',
      titlePrefix: 'Preferences for',
      computedAge: 'Computed age',
      genresTitle: 'Favorite Genres (25 pts weight)',
      genresHint: 'Select the story categories your child enjoys most.',
      languagesTitle: 'Preferred Audio & Subtitle Languages (20 pts weight)',
      languagesHint:
        'Audio matches score full points; subtitle-only matches score partial points.',
      countryLabel: 'Age Classification Standard',
      maxAgeLabel: 'Stricter Maximum Age Cap (Optional)',
      minRatingLabel: 'Minimum Parent Star Filter',
      educationalToggle: 'Prioritize educational content (10 pts weight)',
      educationalHint:
        'Boost cartoons with verified science, nature, or social-learning themes.',
      reviewToggle:
        'Include unverified ratings in separate Parental Review Queue',
      reviewHint:
        'Unverified titles never appear in Approved Matches, but parents can inspect them separately.',
      saveBtn: 'Save Preferences',
      savingBtn: 'Saving & Recalculating...',
    },
    discover: {
      title: 'Cartoon Discovery',
      subtitle:
        'Browse animated movies and TV series with verified regional classifications and audio availability.',
      syncBtn: 'Sync from TMDB',
      syncingBtn: 'Syncing TMDB...',
      tmdbHint:
        'Showing the local verified family catalog. Configure TMDB_API_KEY in Settings → Secrets to sync live releases from The Movie Database.',
      searchPlaceholder: 'Search titles or descriptions...',
      all: 'All',
      tvSeries: 'TV Series',
      movies: 'Movies',
      allGenres: 'All Genres',
      allLanguages: 'All Languages',
      verifiedOnly: 'Verified',
      showingCount: 'Showing',
      titlesLabel: 'animated titles',
      emptyTitle: 'No cartoons match your current filters.',
      emptyHint:
        'Clear your search or filter selections to view the full catalog.',
      verifiedBadge: 'Verified',
      reviewBadge: 'Review',
    },
    recommendations: {
      title: 'Recommendation Results',
      subtitle:
        'Explainable 100-point compatibility rankings with mandatory safety filtering.',
      adjustPreferences: 'Adjust Preferences',
      recalculate: 'Recalculate',
      recalculating: 'Recalculating...',
      approvedTab: 'Approved Matches',
      reviewTab: 'Parental Review',
      verifiedSuitable: 'Verified Suitable',
      reviewRequired: 'Parental Review Required',
      compatibilityScore: 'Compatibility Score',
      whyRecommended: 'Why this was recommended',
      saveFavorite: 'Save Favorite',
      savedFavorite: 'Saved',
      writeReview: 'Add Review',
      hideReview: 'Close Review',
      reviewPlaceholder: 'Short note about pacing, themes, or child reaction...',
      saveReview: 'Save Feedback',
      emptyApproved: 'No verified cartoons matched current filters.',
      emptyReview: 'No titles require parental review right now.',
    },
    details: {
      backToDiscovery: 'Back to Cartoon Discovery',
      playTrailer: 'Play Official Trailer',
      loadingTrailer: 'Searching Official Trailer...',
      closeTrailer: 'Close Trailer',
      officialTrailer: 'Official Trailer',
      genresLabel: 'Genres',
      audioLanguages: 'Audio Languages',
      subtitlesAvailable: 'Subtitles Available',
      noneListed: 'None listed',
      classificationsTitle: 'Regional Age Classifications',
      countryCol: 'Country',
      ratingCol: 'Rating',
      minAgeCol: 'Minimum Age',
      sourceCol: 'Source',
      statusCol: 'Status',
      verified: 'Verified',
      unverified: 'Unverified',
      unknown: 'Unknown',
      compatibilityFor: 'Compatibility for',
      parentRatingFor: 'Parent Rating for',
      addToFavorites: 'Add to Favorites',
      savedInFavorites: 'Saved in Favorites',
      reviewLabel: 'Parent Review (Optional)',
      reviewPlaceholder:
        'Record pacing, themes, or why your child enjoyed or disliked this title...',
      saveFeedbackBtn: 'Save Parent Feedback',
      savingBtn: 'Saving...',
    },
    favorites: {
      title: 'Saved Favorites',
      subtitle:
        'Approved cartoons bookmarked per child profile with parent feedback history.',
      emptyTitle: 'No favorites saved yet for',
      emptyHint:
        'Save titles directly from Recommendation Results or Cartoon Details.',
      viewRecs: 'View Recommendations',
      remove: 'Remove',
      details: 'Details',
      ratingsHistoryTitle: 'Parent Ratings & Reviews History',
      ratingsHistorySubtitle:
        'Feedback stored for this child automatically adjusts future compatibility scores.',
      noRatingsYet: 'No ratings recorded for this child yet.',
      ratedLabel: 'Rated',
    },
  },
  fr: {
    nav: {
      dashboard: 'Tableau de bord',
      discovery: 'Découvrir',
      recommendations: 'Recommandations',
      favorites: 'Favoris',
      signIn: 'Connexion',
      signOut: 'Déconnexion',
      languageLabel: 'Langue',
    },
    footer: {
      tagline:
        'Découverte de dessins animés contrôlée par les parents avec classifications officielles vérifiées et scores explicables.',
      catalogDiscovery: 'Catalogue',
      parentDashboard: 'Tableau parental',
      childProfiles: 'Profils enfants',
      gdprNote: 'Conception minimale RGPD UE',
    },
    landing: {
      kicker: 'Découverte de dessins animés pour parents',
      headline:
        'Des recommandations de dessins animés vérifiées par âge et expliquées clairement.',
      subtitle:
        "Smart Kids analyse les films et séries d'animation selon les classifications régionales (FSK allemand, MPAA), l'âge de votre enfant et ses langues, en expliquant chaque score.",
      ctaDashboard: 'Ouvrir le tableau de bord',
      ctaSignIn: 'Connexion Parent',
      ctaBrowse: 'Parcourir le catalogue',
      strip1Kicker: 'Filtre Étape 1',
      strip1Title: 'Sécurité obligatoire',
      strip1Desc:
        "Exclut les contenus non animés, adultes et classés au-dessus de l'âge de l'enfant.",
      strip2Kicker: 'FSK · MPAA · BBFC',
      strip2Title: 'Normalisation régionale',
      strip2Desc:
        'Les titres non vérifiés passent en révision parentale sans approbation automatique.',
      strip3Kicker: 'Barème sur 100',
      strip3Title: 'Score explicable',
      strip3Desc:
        'Chaque résultat détaille âge, genres, langues audio, valeur éducative et avis parental.',
      strip4Kicker: 'Conforme RGPD UE',
      strip4Title: 'Comptes parents uniquement',
      strip4Desc:
        'Aucun compte requis pour les enfants. Le genre est optionnel et ne filtre jamais.',
      howTitle: 'Comment fonctionne le moteur de recommandation',
      howSubtitle:
        'Basé sur des règles transparentes et une pondération claire plutôt que sur une boîte noire.',
      step1Tag: '01. Profil enfant & âge dynamique',
      step1Title: 'Calculé depuis la date de naissance',
      step1Desc:
        "Les parents saisissent uniquement un prénom ou surnom et une date de naissance. Le genre reste optionnel et n'exclut jamais aucun genre.",
      step2Tag: '02. Vérification des classifications',
      step2Title: "Contrôle d'âge par pays",
      step2Desc:
        'Les classifications officielles (FSK, US, FR, UK) sont normalisées en âges minimums. Les données manquantes restent en révision parentale.',
      step3Tag: '03. Score pondéré sur 100',
      step3Title: 'Raisons claires pour chaque choix',
      step3Desc:
        'Notation transparente : Âge (40), Genres (25), Langues (20), Éducatif (10) et Avis parental (5).',
      catalogTitle: 'Catalogue familial vérifié',
      catalogSubtitle:
        'Consultez les classifications, pistes audio et thèmes éducatifs avant même de vous connecter.',
      exploreAll: 'Explorer tout le catalogue',
    },
    login: {
      badge: 'Accès Parent Uniquement',
      title: 'Connexion à Smart Kids',
      subtitle:
        "Gérez les profils enfants, les règles d'âge, les explications de recommandation et vos favoris.",
      continueGoogle: 'Continuer avec Google',
      signingIn: 'Connexion...',
      childNotice:
        "Les enfants sont bénéficiaires sans accès aux paramètres parentaux.",
      privacyNotice:
        'Votre jeton est vérifié côté serveur et chaque profil enfant peut être supprimé définitivement.',
    },
    dashboard: {
      title: 'Tableau de bord parent',
      manageChildren: 'Gérer les enfants',
      editPreferences: 'Préférences',
      emptyTitle: 'Créez votre premier profil enfant',
      emptyDesc:
        "Ajoutez un surnom et une date de naissance pour calculer l'âge automatiquement et obtenir des recommandations adaptées.",
      createProfile: 'Créer un profil enfant',
      computedAge: 'Âge calculé',
      approvedMatches: 'Titres approuvés',
      verifiedSafe: 'Classifications vérifiées',
      reviewQueue: 'Révision parentale',
      reviewDesc: 'Note absente ou étrangère',
      activeInterests: 'Centres d’intérêt',
      genresLabel: 'genres',
      topRecsTitle: 'Meilleures recommandations pour',
      topRecsSubtitle:
        'Classés sur 100 points selon âge, genres, langues et retours parentaux.',
      refreshScores: 'Recalculer',
      recalculating: 'Calcul...',
      fullReport: 'Rapport complet',
      noMatches: 'Aucun titre vérifié ne correspond aux filtres actuels.',
      adjustPrefsHint:
        'Ajustez les genres ou langues dans les préférences, ou consultez la file de révision.',
      adjustPrefs: 'Modifier les préférences',
      details: 'Détails',
      discoveryCardTitle: 'Découverte & Synchronisation TMDB',
      discoveryCardDesc:
        'Recherchez des dessins animés ou synchronisez depuis TMDB.',
      favoritesCardTitle: 'Favoris enregistrés',
      favoritesCardDesc:
        'Consultez les titres favoris et les avis pour',
    },
    children: {
      title: 'Gestion des profils enfants',
      subtitle:
        "Seuls le surnom et la date de naissance sont requis. L'âge est calculé dynamiquement.",
      addTitle: 'Ajouter un profil enfant',
      editTitle: 'Modifier le profil enfant',
      nicknameLabel: "Surnom de l'enfant",
      nicknamePlaceholder: 'ex. Adam ou Lina',
      birthDateLabel: 'Date de naissance',
      genderLabel: 'Genre (Optionnel)',
      genderUnspecified: 'Ne pas préciser (Recommandé)',
      genderBoy: 'Garçon',
      genderGirl: 'Fille',
      genderOther: 'Autre',
      genderHelp: 'Jamais utilisé pour filtrer ou exclure des genres.',
      saveChanges: 'Enregistrer',
      createProfile: 'Créer le profil',
      saving: 'Enregistrement...',
      cancel: 'Annuler',
      noProfiles: 'Aucun profil enfant créé.',
      noProfilesHint: 'Utilisez le formulaire pour ajouter votre premier enfant.',
      preferencesBtn: 'Préférences',
      editBtn: 'Modifier',
      deleteBtn: 'Supprimer',
      confirmDeleteMsg:
        'Supprimer définitivement ce profil, ses préférences, favoris et avis ?',
      confirmDeleteBtn: 'Confirmer',
    },
    preferences: {
      backToChildren: 'Retour aux profils',
      titlePrefix: 'Préférences pour',
      computedAge: 'Âge calculé',
      genresTitle: 'Genres favoris (25 pts)',
      genresHint: 'Sélectionnez les catégories appréciées par votre enfant.',
      languagesTitle: 'Langues audio et sous-titres (20 pts)',
      languagesHint:
        "L'audio rapporte le maximum de points ; les sous-titres un score partiel.",
      countryLabel: 'Norme de classification par âge',
      maxAgeLabel: 'Plafond d’âge plus strict (Optionnel)',
      minRatingLabel: 'Note parentale minimale',
      educationalToggle: 'Prioriser le contenu éducatif (10 pts)',
      educationalHint:
        'Met en avant les thèmes scientifiques, nature et apprentissage.',
      reviewToggle:
        'Inclure les titres non vérifiés dans la file de révision parentale',
      reviewHint:
        "Ces titres n'apparaissent jamais dans les résultats approuvés automatiquement.",
      saveBtn: 'Enregistrer les préférences',
      savingBtn: 'Enregistrement et calcul...',
    },
    discover: {
      title: 'Découvrir les dessins animés',
      subtitle:
        'Parcourez les films et séries animés avec classifications vérifiées et langues disponibles.',
      syncBtn: 'Synchroniser TMDB',
      syncingBtn: 'Synchronisation...',
      tmdbHint:
        'Catalogue local affiché. Configurez TMDB_API_KEY dans Settings → Secrets pour synchroniser TMDB en direct.',
      searchPlaceholder: 'Rechercher un titre ou résumé...',
      all: 'Tous',
      tvSeries: 'Séries TV',
      movies: 'Films',
      allGenres: 'Tous les genres',
      allLanguages: 'Toutes les langues',
      verifiedOnly: 'Vérifiés',
      showingCount: 'Affichage de',
      titlesLabel: 'titres animés',
      emptyTitle: 'Aucun dessin animé ne correspond aux filtres.',
      emptyHint: 'Effacez la recherche ou changez les filtres.',
      verifiedBadge: 'Vérifié',
      reviewBadge: 'Révision',
    },
    recommendations: {
      title: 'Résultats des recommandations',
      subtitle:
        'Classement explicable sur 100 points avec filtrage de sécurité obligatoire.',
      adjustPreferences: 'Préférences',
      recalculate: 'Recalculer',
      recalculating: 'Calcul...',
      approvedTab: 'Approuvés',
      reviewTab: 'Révision parentale',
      verifiedSuitable: 'Vérifié adapté',
      reviewRequired: 'Révision parentale requise',
      compatibilityScore: 'Score de compatibilité',
      whyRecommended: 'Pourquoi ce choix',
      saveFavorite: 'Ajouter aux favoris',
      savedFavorite: 'Enregistré',
      writeReview: 'Laisser un avis',
      hideReview: 'Fermer',
      reviewPlaceholder: 'Note courte sur le rythme ou les thèmes...',
      saveReview: 'Enregistrer l’avis',
      emptyApproved: 'Aucun titre vérifié pour les filtres actuels.',
      emptyReview: 'Aucun titre en attente de révision.',
    },
    details: {
      backToDiscovery: 'Retour au catalogue',
      playTrailer: 'Lire la bande-annonce officielle',
      loadingTrailer: 'Recherche de la bande-annonce...',
      closeTrailer: 'Fermer la vidéo',
      officialTrailer: 'Bande-annonce officielle',
      genresLabel: 'Genres',
      audioLanguages: 'Langues audio',
      subtitlesAvailable: 'Sous-titres disponibles',
      noneListed: 'Aucun listé',
      classificationsTitle: 'Classifications régionales par âge',
      countryCol: 'Pays',
      ratingCol: 'Note',
      minAgeCol: 'Âge min.',
      sourceCol: 'Source',
      statusCol: 'Statut',
      verified: 'Vérifié',
      unverified: 'Non vérifié',
      unknown: 'Inconnu',
      compatibilityFor: 'Compatibilité pour',
      parentRatingFor: 'Évaluation parentale pour',
      addToFavorites: 'Ajouter aux favoris',
      savedInFavorites: 'Dans les favoris',
      reviewLabel: 'Avis parental (Optionnel)',
      reviewPlaceholder:
        'Notez le rythme, les thèmes ou la réaction de votre enfant...',
      saveFeedbackBtn: 'Enregistrer l’avis',
      savingBtn: 'Enregistrement...',
    },
    favorites: {
      title: 'Favoris enregistrés',
      subtitle:
        'Titres favoris par profil enfant et historique des avis parentaux.',
      emptyTitle: 'Aucun favori enregistré pour',
      emptyHint:
        'Ajoutez des favoris depuis les Recommandations ou la fiche détaillée.',
      viewRecs: 'Voir les recommandations',
      remove: 'Retirer',
      details: 'Détails',
      ratingsHistoryTitle: 'Historique des notes et avis parentaux',
      ratingsHistorySubtitle:
        'Les avis enregistrés ajustent automatiquement les futures recommandations.',
      noRatingsYet: 'Aucune note enregistrée pour cet enfant.',
      ratedLabel: 'Noté',
    },
  },
  de: {
    nav: {
      dashboard: 'Übersicht',
      discovery: 'Entdecken',
      recommendations: 'Empfehlungen',
      favorites: 'Favoriten',
      signIn: 'Anmelden',
      signOut: 'Abmelden',
      languageLabel: 'Sprache',
    },
    footer: {
      tagline:
        'Elterngeführte Zeichentrick-Empfehlungen mit geprüften Altersfreigaben (FSK) und nachvollziehbarer Bewertung.',
      catalogDiscovery: 'Katalog',
      parentDashboard: 'Eltern-Dashboard',
      childProfiles: 'Kinderprofile',
      gdprNote: 'DSGVO-konforme Datensparsamkeit',
    },
    landing: {
      kicker: 'Elterngeführte Zeichentrick-Suche',
      headline:
        'Altersgeprüfte Zeichentrick-Empfehlungen, die Eltern sofort nachvollziehen können.',
      subtitle:
        'Smart Kids prüft Animationsfilme und Serien anhand offizieller Altersfreigaben wie deutscher FSK, passt sie an Alter und Sprachen Ihres Kindes an und erklärt jeden Score transparent.',
      ctaDashboard: 'Zum Eltern-Dashboard',
      ctaSignIn: 'Als Elternteil anmelden',
      ctaBrowse: 'Katalog ansehen',
      strip1Kicker: 'Stufe 1 Filter',
      strip1Title: 'Sicherheitsprüfung',
      strip1Desc:
        'Schließt nicht-animierte Titel, Erwachseneninhalte und zu hohe Altersfreigaben aus.',
      strip2Kicker: 'FSK · MPAA · BBFC',
      strip2Title: 'Regionale Normierung',
      strip2Desc:
        'Ungeprüfte Freigaben werden nie automatisch freigegeben, sondern Eltern zur Prüfung vorgelegt.',
      strip3Kicker: '100-Punkte-System',
      strip3Title: 'Erklärbare Scores',
      strip3Desc:
        'Jeder Treffer zeigt Punkte für Alter, Genres, Sprachen, Lernwert und Eltern-Feedback.',
      strip4Kicker: 'EU-DSGVO bewusst',
      strip4Title: 'Nur Elternkonten',
      strip4Desc:
        'Kinder benötigen kein Konto. Geschlecht ist optional und schränkt Genres niemals ein.',
      howTitle: 'So arbeitet die hybride Empfehlungs-Engine',
      howSubtitle:
        'Basierend auf klaren Sicherheitsregeln und transparenter Gewichtung statt einer undurchsichtigen Blackbox.',
      step1Tag: '01. Kinderprofil & dynamisches Alter',
      step1Title: 'Aus dem Geburtsdatum berechnet',
      step1Desc:
        'Eltern erfassen nur einen Spitznamen und das Geburtsdatum. Das optionale Geschlecht beeinflusst die Empfehlungen nicht.',
      step2Tag: '02. Freigabe-Prüfung',
      step2Title: 'Länderspezifische Alterskontrolle',
      step2Desc:
        'Offizielle Freigaben (FSK 0/6/12, US, FR, UK) werden auf Mindestalter normiert. Fehlende Angaben landen in der Elternprüfung.',
      step3Tag: '03. 100-Punkte-Bewertung',
      step3Title: 'Klare Gründe für jeden Vorschlag',
      step3Desc:
        'Gewichtung: Alter (40), Genres (25), Sprachen (20), Lerninhalte (10) und Eltern-Feedback (5).',
      catalogTitle: 'Geprüfter Familienkatalog',
      catalogSubtitle:
        'Altersfreigaben, Audiosprachen und Lerninhalte schon vor der Anmeldung einsehen.',
      exploreAll: 'Alle Titel entdecken',
    },
    login: {
      badge: 'Nur für Eltern',
      title: 'Bei Smart Kids anmelden',
      subtitle:
        'Kinderprofile verwalten, FSK-Regeln festlegen, Empfehlungsgründe prüfen und Favoriten speichern.',
      continueGoogle: 'Mit Google fortfahren',
      signingIn: 'Anmeldung...',
      childNotice:
        'Kinder sind indirekte Nutznießer und erhalten keinen Zugang zu Elterneinstellungen.',
      privacyNotice:
        'Ihr Token wird serverseitig verifiziert und Kinderprofile können jederzeit vollständig gelöscht werden.',
    },
    dashboard: {
      title: 'Eltern-Dashboard',
      manageChildren: 'Kinder verwalten',
      editPreferences: 'Präferenzen',
      emptyTitle: 'Erstellen Sie Ihr erstes Kinderprofil',
      emptyDesc:
        'Legen Sie Spitznamen und Geburtsdatum an, um das Alter automatisch zu berechnen und passende Zeichentrickfilme zu erhalten.',
      createProfile: 'Kinderprofil erstellen',
      computedAge: 'Berechnetes Alter',
      approvedMatches: 'Freigegebene Treffer',
      verifiedSafe: 'Geprüfte Altersfreigaben',
      reviewQueue: 'Elternprüfung',
      reviewDesc: 'Ungeprüfte Freigabe',
      activeInterests: 'Aktive Interessen',
      genresLabel: 'Genres',
      topRecsTitle: 'Top-Empfehlungen für',
      topRecsSubtitle:
        'Sortiert nach 100-Punkte-Kompatibilität für Alter, Genres, Sprachen und Bewertungen.',
      refreshScores: 'Neu berechnen',
      recalculating: 'Berechnet...',
      fullReport: 'Vollständiger Bericht',
      noMatches: 'Keine geprüften Empfehlungen für die aktuellen Filter.',
      adjustPrefsHint:
        'Passen Sie Genres oder Sprachen an oder prüfen Sie die Warteschlange.',
      adjustPrefs: 'Präferenzen anpassen',
      details: 'Details',
      discoveryCardTitle: 'Katalog & TMDB-Synchronisation',
      discoveryCardDesc:
        'Durchsuchen Sie alle Animationstitel oder laden Sie neue Daten von TMDB.',
      favoritesCardTitle: 'Gespeicherte Favoriten',
      favoritesCardDesc:
        'Merkliste und frühere Bewertungen ansehen für',
    },
    children: {
      title: 'Kinderprofile verwalten',
      subtitle:
        'Nur Spitzname und Geburtsdatum sind nötig. Das Alter wird dynamisch berechnet.',
      addTitle: 'Kinderprofil hinzufügen',
      editTitle: 'Kinderprofil bearbeiten',
      nicknameLabel: 'Spitzname des Kindes',
      nicknamePlaceholder: 'z. B. Adam oder Lina',
      birthDateLabel: 'Geburtsdatum',
      genderLabel: 'Geschlecht (Optional)',
      genderUnspecified: 'Keine Angabe (Empfohlen)',
      genderBoy: 'Junge',
      genderGirl: 'Mädchen',
      genderOther: 'Divers',
      genderHelp: 'Wird niemals zum Filtern von Genres verwendet.',
      saveChanges: 'Speichern',
      createProfile: 'Profil erstellen',
      saving: 'Speichern...',
      cancel: 'Abbrechen',
      noProfiles: 'Noch keine Kinderprofile vorhanden.',
      noProfilesHint: 'Fügen Sie links Ihr erstes Kinderprofil hinzu.',
      preferencesBtn: 'Präferenzen',
      editBtn: 'Bearbeiten',
      deleteBtn: 'Löschen',
      confirmDeleteMsg:
        'Dieses Profil, Präferenzen, Favoriten und Bewertungen endgültig löschen?',
      confirmDeleteBtn: 'Endgültig löschen',
    },
    preferences: {
      backToChildren: 'Zurück zu den Profilen',
      titlePrefix: 'Präferenzen für',
      computedAge: 'Berechnetes Alter',
      genresTitle: 'Lieblingsgenres (25 Punkte)',
      genresHint: 'Wählen Sie die Kategorien, die Ihr Kind mag.',
      languagesTitle: 'Bevorzugte Audio- & Untertitelsprachen (20 Punkte)',
      languagesHint:
        'Audiospuren geben volle Punktzahl; Untertitel anteilige Punkte.',
      countryLabel: 'Altersfreigabe-Standard',
      maxAgeLabel: 'Strengere Altersgrenze (Optional)',
      minRatingLabel: 'Mindest-Sternebewertung',
      educationalToggle: 'Lerninhalte bevorzugen (10 Punkte)',
      educationalHint:
        'Bevorzugt Serien und Filme mit Natur-, Wissenschafts- oder Sozialthemen.',
      reviewToggle:
        'Ungeprüfte Titel in separater Elternprüfungs-Liste anzeigen',
      reviewHint:
        'Ungeprüfte Titel erscheinen nie in freigegebenen Empfehlungen.',
      saveBtn: 'Präferenzen speichern',
      savingBtn: 'Speichern & neu berechnen...',
    },
    discover: {
      title: 'Zeichentrick-Katalog',
      subtitle:
        'Entdecken Sie Animationsfilme und -serien mit geprüften Altersfreigaben und Sprachspuren.',
      syncBtn: 'Mit TMDB synchronisieren',
      syncingBtn: 'Synchronisiere...',
      tmdbHint:
        'Lokaler Familienkatalog aktiv. Hinterlegen Sie TMDB_API_KEY in Settings → Secrets für Live-TMDB-Synchronisation.',
      searchPlaceholder: 'Titel oder Beschreibung suchen...',
      all: 'Alle',
      tvSeries: 'TV-Serien',
      movies: 'Filme',
      allGenres: 'Alle Genres',
      allLanguages: 'Alle Sprachen',
      verifiedOnly: 'Geprüft',
      showingCount: 'Zeige',
      titlesLabel: 'Animationstitel',
      emptyTitle: 'Keine Titel entsprechen Ihren Filtern.',
      emptyHint: 'Setzen Sie Suche oder Filter zurück.',
      verifiedBadge: 'Geprüft',
      reviewBadge: 'Prüfen',
    },
    recommendations: {
      title: 'Empfehlungsergebnisse',
      subtitle:
        'Nachvollziehbare 100-Punkte-Bewertung mit verbindlichem Sicherheitsfilter.',
      adjustPreferences: 'Präferenzen',
      recalculate: 'Neu berechnen',
      recalculating: 'Berechnet...',
      approvedTab: 'Freigegeben',
      reviewTab: 'Elternprüfung',
      verifiedSuitable: 'Geprüft geeignet',
      reviewRequired: 'Elternprüfung erforderlich',
      compatibilityScore: 'Kompatibilitäts-Score',
      whyRecommended: 'Warum empfohlen',
      saveFavorite: 'Merken',
      savedFavorite: 'Gemerkt',
      writeReview: 'Rezension hinzufügen',
      hideReview: 'Schließen',
      reviewPlaceholder: 'Kurze Notiz zu Tempo, Themen oder Reaktion...',
      saveReview: 'Bewertung speichern',
      emptyApproved: 'Keine geprüften Titel für diese Filter gefunden.',
      emptyReview: 'Derzeit keine Titel in der Elternprüfung.',
    },
    details: {
      backToDiscovery: 'Zurück zum Katalog',
      playTrailer: 'Offiziellen Trailer abspielen',
      loadingTrailer: 'Suche offiziellen Trailer...',
      closeTrailer: 'Trailer schließen',
      officialTrailer: 'Offizieller Trailer',
      genresLabel: 'Genres',
      audioLanguages: 'Audiosprachen',
      subtitlesAvailable: 'Verfügbare Untertitel',
      noneListed: 'Keine angegeben',
      classificationsTitle: 'Regionale Altersfreigaben',
      countryCol: 'Land',
      ratingCol: 'Freigabe',
      minAgeCol: 'Mindestalter',
      sourceCol: 'Quelle',
      statusCol: 'Status',
      verified: 'Geprüft',
      unverified: 'Ungeprüft',
      unknown: 'Unbekannt',
      compatibilityFor: 'Kompatibilität für',
      parentRatingFor: 'Elternbewertung für',
      addToFavorites: 'Zu Favoriten',
      savedInFavorites: 'In Favoriten',
      reviewLabel: 'Eltern-Rezension (Optional)',
      reviewPlaceholder:
        'Notieren Sie Tempo, Themen oder warum Ihr Kind diesen Titel mochte...',
      saveFeedbackBtn: 'Bewertung speichern',
      savingBtn: 'Speichern...',
    },
    favorites: {
      title: 'Gespeicherte Favoriten',
      subtitle:
        'Gemerkte Zeichentricktitel und Bewertungsverlauf pro Kinderprofil.',
      emptyTitle: 'Noch keine Favoriten für',
      emptyHint:
        'Speichern Sie Titel direkt aus den Empfehlungen oder Details.',
      viewRecs: 'Empfehlungen ansehen',
      remove: 'Entfernen',
      details: 'Details',
      ratingsHistoryTitle: 'Verlauf der Elternbewertungen',
      ratingsHistorySubtitle:
        'Gespeichertes Feedback passt zukünftige Empfehlungs-Scores automatisch an.',
      noRatingsYet: 'Noch keine Bewertungen für dieses Kind gespeichert.',
      ratedLabel: 'Bewertet',
    },
  },
  ar: {
    nav: {
      dashboard: 'لوحة التحكم',
      discovery: 'استكشاف',
      recommendations: 'التوصيات',
      favorites: 'المفضلة',
      signIn: 'تسجيل الدخول',
      signOut: 'تسجيل الخروج',
      languageLabel: 'اللغة',
    },
    footer: {
      tagline:
        'منصة تحت إشراف الأولياء لاكتشاف الرسوم المتحركة بتصنيفات عمرية موثقة وتقييمات توافق شفافة.',
      catalogDiscovery: 'استكشاف الكتالوج',
      parentDashboard: 'لوحة الولي',
      childProfiles: 'ملفات الأطفال',
      gdprNote: 'تصميم يراعي خصوصية البيانات GDPR',
    },
    landing: {
      kicker: 'نظام ذكي لاكتشاف الرسوم المتحركة للأولياء',
      headline:
        'توصيات كرتونية مناسبة لعمر طفلك مع تصنيفات موثقة وشرح شفاف.',
      subtitle:
        'يحلل Smart Kids أفلام ومسلسلات الرسوم المتحركة وفق التصنيفات العمرية الرسمية مثل FSK الألماني، ويطابقها مع عمر طفلك ولغاته المفضلة مع توضيح سبب كل توصية.',
      ctaDashboard: 'فتح لوحة الولي',
      ctaSignIn: 'دخول الولي',
      ctaBrowse: 'تصفح الكتالوج الموثق',
      strip1Kicker: 'تصفية المرحلة الأولى',
      strip1Title: 'بوابة أمان إلزامية',
      strip1Desc:
        'يستبعد الأعمال غير الكرتونية ومحتوى البالغين وأي تصنيف يتجاوز عمر الطفل.',
      strip2Kicker: 'FSK · MPAA · BBFC',
      strip2Title: 'توحيد التصنيفات الإقليمية',
      strip2Desc:
        'التصنيفات غير المؤكدة لا تُعتمد تلقائياً وتُرسل لمراجعة الولي.',
      strip3Kicker: 'تقييم من 100 نقطة',
      strip3Title: 'نتائج قابلة للتفسير',
      strip3Desc:
        'كل توصية تعرض نقاط العمر والأنواع واللغات والقيمة التعليمية وتقييم الولي.',
      strip4Kicker: 'مراعاة الخصوصية GDPR',
      strip4Title: 'حسابات للأولياء فقط',
      strip4Desc:
        'الأطفال لا يحتاجون حسابات، وحقل الجنس اختياري ولا يقيّد أي نوع.',
      howTitle: 'كيف يعمل محرك التوصيات الهجين',
      howSubtitle:
        'مبني على قواعد أمان صارمة ونظام نقاط شفاف بدلاً من الخوارزميات المغلقة.',
      step1Tag: '01. ملف الطفل والعمر الديناميكي',
      step1Title: 'يُحسب تلقائياً من تاريخ الميلاد',
      step1Desc:
        'يسجّل الولي لقباً وتاريخ ميلاد فقط ليبقى العمر دقيقاً مع الوقت، ولا يُستخدم الجنس لاستبعاد أي نوع كرتوني.',
      step2Tag: '02. التحقق من التصنيف العمري',
      step2Title: 'فحص التصنيفات الرسمية حسب البلد',
      step2Desc:
        'يتم توحيد تصنيفات FSK الألمانية وUS وFR وGB إلى أعمار دنيا، بينما تبقى التصنيفات الناقصة في مراجعة الولي.',
      step3Tag: '03. مطابقة موزونة من 100 نقطة',
      step3Title: 'أسباب واضحة لكل اقتراح',
      step3Desc:
        'توزيع النقاط: العمر (40)، الأنواع المفضلة (25)، اللغات (20)، المحتوى التعليمي (10)، وتقييمات الولي (5).',
      catalogTitle: 'الكتالوج العائلي الموثق',
      catalogSubtitle:
        'تصفح التصنيفات العمرية واللغات المتوفرة والموضوعات التعليمية قبل تسجيل الدخول.',
      exploreAll: 'استكشاف جميع الرسوم المتحركة',
    },
    login: {
      badge: 'دخول الأولياء فقط',
      title: 'تسجيل الدخول إلى Smart Kids',
      subtitle:
        'أدر ملفات الأطفال، اضبط قواعد التصنيف العمري، استعرض أسباب التوصيات، واحفظ المفضلة.',
      continueGoogle: 'المتابعة عبر Google',
      signingIn: 'جارٍ تسجيل الدخول...',
      childNotice:
        'الأطفال مستفيدون غير مباشرين ولا يملكون بيانات دخول أو وصولاً لإعدادات الولي.',
      privacyNotice:
        'يتم التحقق من الجلسة على الخادم ويمكن حذف ملف الطفل وبياناته نهائياً في أي وقت.',
    },
    dashboard: {
      title: 'لوحة تحكم الولي',
      manageChildren: 'إدارة الأطفال',
      editPreferences: 'تعديل التفضيلات',
      emptyTitle: 'ابدأ بإنشاء أول ملف لطفلك',
      emptyDesc:
        'أضف لقباً وتاريخ ميلاد لحساب العمر تلقائياً وتحديد الأنواع واللغات المفضلة.',
      createProfile: 'إنشاء ملف طفل',
      computedAge: 'العمر المحسوب',
      approvedMatches: 'نتائج معتمدة',
      verifiedSafe: 'تصنيفات عمرية موثقة',
      reviewQueue: 'مراجعة الولي',
      reviewDesc: 'تصنيف ناقص أو غير مؤكد',
      activeInterests: 'الاهتمامات النشطة',
      genresLabel: 'أنواع',
      topRecsTitle: 'أفضل التوصيات لـ',
      topRecsSubtitle:
        'مرتبة حسب التوافق من 100 نقطة وفق العمر والأنواع واللغات وتقييماتك.',
      refreshScores: 'تحديث النقاط',
      recalculating: 'جارٍ الحساب...',
      fullReport: 'التقرير الكامل',
      noMatches: 'لا توجد توصيات موثقة تطابق الفلاتر الحالية.',
      adjustPrefsHint:
        'جرّب تعديل الأنواع أو اللغات أو راجع قائمة مراجعة الولي.',
      adjustPrefs: 'تعديل التفضيلات',
      details: 'التفاصيل',
      discoveryCardTitle: 'استكشاف الكتالوج ومزامنة TMDB',
      discoveryCardDesc:
        'ابحث في جميع الرسوم المتحركة أو زامن إصدارات جديدة من TMDB.',
      favoritesCardTitle: 'المفضلة المحفوظة',
      favoritesCardDesc: 'استعرض المفضلة وسجل تقييمات الولي لـ',
    },
    children: {
      title: 'إدارة ملفات الأطفال',
      subtitle:
        'يلزم إدخال اللقب وتاريخ الميلاد فقط، ويُحسب العمر ديناميكياً عند كل فحص.',
      addTitle: 'إضافة ملف طفل',
      editTitle: 'تعديل ملف الطفل',
      nicknameLabel: 'لقب الطفل',
      nicknamePlaceholder: 'مثال: آدم أو لينا',
      birthDateLabel: 'تاريخ الميلاد',
      genderLabel: 'الجنس (اختياري)',
      genderUnspecified: 'تفضيل عدم التحديد (مستحسن)',
      genderBoy: 'ذكر',
      genderGirl: 'أنثى',
      genderOther: 'آخر',
      genderHelp: 'لا يُستخدم أبداً لتصفية أو استبعاد أي نوع كرتوني.',
      saveChanges: 'حفظ التعديلات',
      createProfile: 'إنشاء الملف',
      saving: 'جارٍ الحفظ...',
      cancel: 'إلغاء',
      noProfiles: 'لا توجد ملفات أطفال بعد.',
      noProfilesHint: 'استخدم النموذج لإضافة أول ملف لطفلك.',
      preferencesBtn: 'التفضيلات',
      editBtn: 'تعديل',
      deleteBtn: 'حذف',
      confirmDeleteMsg:
        'هل تريد حذف هذا الملف مع جميع تفضيلاته ومفضلاته وتقييماته نهائياً؟',
      confirmDeleteBtn: 'تأكيد الحذف',
    },
    preferences: {
      backToChildren: 'العودة إلى ملفات الأطفال',
      titlePrefix: 'تفضيلات',
      computedAge: 'العمر المحسوب',
      genresTitle: 'الأنواع المفضلة (25 نقطة)',
      genresHint: 'اختر أنواع القصص التي يفضلها طفلك.',
      languagesTitle: 'اللغات المفضلة للصوت والترجمة (20 نقطة)',
      languagesHint:
        'توفر الصوت يمنح العلامة الكاملة، والترجمة فقط تمنح نقاطاً جزئية.',
      countryLabel: 'معيار التصنيف العمري',
      maxAgeLabel: 'حد عمري أكثر صرامة (اختياري)',
      minRatingLabel: 'تصفية حسب تقييم الولي الأدنى',
      educationalToggle: 'إعطاء أولوية للمحتوى التعليمي (10 نقاط)',
      educationalHint:
        'يعزز الأعمال التي تتناول العلوم والطبيعة والمهارات الاجتماعية.',
      reviewToggle:
        'إظهار التصنيفات غير المؤكدة في قائمة مراجعة الولي المنفصلة',
      reviewHint:
        'لا تظهر أبداً في النتائج المعتمدة تلقائياً، ويمكنك فحصها يدوياً.',
      saveBtn: 'حفظ التفضيلات',
      savingBtn: 'جارٍ الحفظ وإعادة الحساب...',
    },
    discover: {
      title: 'استكشاف الرسوم المتحركة',
      subtitle:
        'تصفح الأفلام والمسلسلات الكرتونية مع التصنيفات العمرية واللغات المتوفرة.',
      syncBtn: 'مزامنة من TMDB',
      syncingBtn: 'جارٍ المزامنة...',
      tmdbHint:
        'يُعرض الكتالوج العائلي الموثق. أضف TMDB_API_KEY في الإعدادات ← الأسرار للمزامنة المباشرة من TMDB.',
      searchPlaceholder: 'ابحث بالعنوان أو الوصف...',
      all: 'الكل',
      tvSeries: 'مسلسلات',
      movies: 'أفلام',
      allGenres: 'كل الأنواع',
      allLanguages: 'كل اللغات',
      verifiedOnly: 'موثق فقط',
      showingCount: 'عرض',
      titlesLabel: 'عمل كرتوني',
      emptyTitle: 'لا توجد نتائج تطابق الفلاتر الحالية.',
      emptyHint: 'امسح البحث أو غيّر خيارات التصفية.',
      verifiedBadge: 'موثق',
      reviewBadge: 'مراجعة',
    },
    recommendations: {
      title: 'نتائج التوصيات',
      subtitle: 'ترتيب توافق من 100 نقطة مع تصفية أمان إلزامية وتفسير واضح.',
      adjustPreferences: 'التفضيلات',
      recalculate: 'إعادة الحساب',
      recalculating: 'جارٍ الحساب...',
      approvedTab: 'نتائج معتمدة',
      reviewTab: 'مراجعة الولي',
      verifiedSuitable: 'موثق ومناسب',
      reviewRequired: 'يتطلب مراجعة الولي',
      compatibilityScore: 'نقاط التوافق',
      whyRecommended: 'سبب التوصية',
      saveFavorite: 'حفظ في المفضلة',
      savedFavorite: 'محفوظ',
      writeReview: 'إضافة مراجعة',
      hideReview: 'إغلاق',
      reviewPlaceholder: 'ملاحظة قصيرة حول الإيقاع أو الموضوعات...',
      saveReview: 'حفظ التقييم',
      emptyApproved: 'لا توجد نتائج معتمدة تطابق التفضيلات الحالية.',
      emptyReview: 'لا توجد أعمال بانتظار مراجعة الولي حالياً.',
    },
    details: {
      backToDiscovery: 'العودة إلى الاستكشاف',
      playTrailer: 'تشغيل الإعلان الرسمي',
      loadingTrailer: 'جارٍ البحث عن الإعلان الرسمي...',
      closeTrailer: 'إغلاق الفيديو',
      officialTrailer: 'الإعلان الرسمي',
      genresLabel: 'الأنواع',
      audioLanguages: 'لغات الصوت',
      subtitlesAvailable: 'الترجمات المتوفرة',
      noneListed: 'غير محددة',
      classificationsTitle: 'التصنيفات العمرية الإقليمية',
      countryCol: 'البلد',
      ratingCol: 'التصنيف',
      minAgeCol: 'العمر الأدنى',
      sourceCol: 'المصدر',
      statusCol: 'الحالة',
      verified: 'موثق',
      unverified: 'غير مؤكد',
      unknown: 'غير معروف',
      compatibilityFor: 'نسبة التوافق لـ',
      parentRatingFor: 'تقييم الولي لـ',
      addToFavorites: 'إضافة للمفضلة',
      savedInFavorites: 'في المفضلة',
      reviewLabel: 'مراجعة الولي (اختياري)',
      reviewPlaceholder: 'اكتب ملاحظة حول المحتوى أو تفاعل طفلك معه...',
      saveFeedbackBtn: 'حفظ تقييم الولي',
      savingBtn: 'جارٍ الحفظ...',
    },
    favorites: {
      title: 'المفضلة المحفوظة',
      subtitle: 'الرسوم المتحركة المحفوظة وسجل تقييمات الولي لكل طفل.',
      emptyTitle: 'لا توجد مفضلات محفوظة بعد لـ',
      emptyHint: 'احفظ الأعمال من صفحة التوصيات أو صفحة التفاصيل.',
      viewRecs: 'عرض التوصيات',
      remove: 'إزالة',
      details: 'التفاصيل',
      ratingsHistoryTitle: 'سجل تقييمات ومراجعات الولي',
      ratingsHistorySubtitle:
        'تؤثر هذه التقييمات تلقائياً في تحسين نقاط التوصيات المستقبلية.',
      noRatingsYet: 'لا توجد تقييمات مسجلة لهذا الطفل بعد.',
      ratedLabel: 'التقييم',
    },
  },
};

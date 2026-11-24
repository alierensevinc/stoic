import WidgetKit
import SwiftUI

struct Provider: TimelineProvider {
    private static let appGroupId = "group.com.sevincaeren.stoic.QuoteWidget"

    func placeholder(in context: Context) -> QuoteEntryWrapper {
        QuoteEntryWrapper(
            date: Date(),
            quote: QuoteEntry(
                text: "Wealth consists not in having great possessions, but in having few wants.",
                author: "Epictetus"
            )
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (QuoteEntryWrapper) -> ()) {
        let entry = QuoteEntryWrapper(date: Date(), quote: quoteOfTheDay(for: Date(), family: context.family))
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<QuoteEntryWrapper>) -> ()) {
        let currentDate = Date()
        let entry = QuoteEntryWrapper(
            date: currentDate,
            quote: quoteOfTheDay(for: currentDate, family: context.family)
        )

        // Refresh at start of tomorrow so the widget rotates with the app's Quote of the Day
        let calendar = Calendar.current
        let nextDay = calendar.startOfDay(
            for: calendar.date(byAdding: .day, value: 1, to: currentDate) ?? currentDate.addingTimeInterval(3600 * 6)
        )
        let timeline = Timeline(entries: [entry], policy: .after(nextDay))
        completion(timeline)
    }

    /// Uses the same FNV-1a YYYY-MM-DD hash algorithm as the JS `getQuoteOfTheDay` function
    /// (or reads a shared override written into the App Group container if available).
    private func quoteOfTheDay(for date: Date, family: WidgetFamily) -> QuoteEntry {
        if let defaults = UserDefaults(suiteName: Self.appGroupId),
           let sharedText = defaults.string(forKey: "qotd_text"),
           let sharedAuthor = defaults.string(forKey: "qotd_author"),
           !sharedText.isEmpty,
           family != .accessoryRectangular || sharedText.count <= 110 {
            return QuoteEntry(text: sharedText, author: sharedAuthor)
        }

        let source = (family == .accessoryRectangular) ? QuotesData.short : QuotesData.all
        guard !source.isEmpty else {
            return QuoteEntry(
                text: "Wealth consists not in having great possessions, but in having few wants.",
                author: "Epictetus"
            )
        }

        let calendar = Calendar.current
        let year = calendar.component(.year, from: date)
        let month = calendar.component(.month, from: date)
        let day = calendar.component(.day, from: date)
        let dateKey = String(format: "%04d-%02d-%02d", year, month, day)

        var hash: UInt32 = 2166136261
        for byte in dateKey.utf8 {
            hash ^= UInt32(byte)
            hash = hash &* 16777619
        }
        let index = Int(hash % UInt32(source.count))
        return source[index]
    }
}

struct QuoteEntryWrapper: TimelineEntry {
    let date: Date
    let quote: QuoteEntry

    var deepLinkURL: URL? {
        var components = URLComponents()
        components.scheme = "stoic"
        components.host = "quote"
        components.path = "/\(quote.text)"
        return components.url
    }
}

struct QuoteWidgetEntryView : View {
    var entry: Provider.Entry
    @Environment(\.colorScheme) var colorScheme
    @Environment(\.widgetFamily) var family

    var themeColors: Theme.Colors {
        return colorScheme == .dark ? Theme.dark : Theme.light
    }

    var body: some View {
        Group {
            if family == .accessoryRectangular {
                ZStack {
                    ContainerRelativeShape()
                        .fill(Color.clear)

                    VStack(alignment: .leading, spacing: 2) {
                        Text(entry.quote.text)
                            .font(.system(size: 14, weight: .medium, design: .serif))
                            .multilineTextAlignment(.leading)
                            .minimumScaleFactor(0.8)
                            .lineLimit(2)

                        Text("- \(entry.quote.author)")
                            .font(.system(size: 10, weight: .regular, design: .default))
                            .opacity(0.8)
                    }
                }
            } else {
                ZStack {
                    themeColors.background
                        .ignoresSafeArea()

                    VStack(alignment: .leading, spacing: 10) {
                        Text(entry.quote.text)
                            .font(.system(size: 16, weight: .medium, design: .serif))
                            .foregroundColor(themeColors.text)
                            .multilineTextAlignment(.leading)
                            .minimumScaleFactor(0.8)

                        Text("- \(entry.quote.author)")
                            .font(.system(size: 14, weight: .regular, design: .default))
                            .foregroundColor(themeColors.text.opacity(0.8))
                    }
                    .padding()
                }
            }
        }
        .widgetURL(entry.deepLinkURL)
    }
}

struct QuoteWidget: Widget {
    let kind: String = "QuoteWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            if #available(iOS 17.0, *) {
                QuoteWidgetEntryView(entry: entry)
                    .containerBackground(for: .widget) {
                        QuoteWidgetEntryView(entry: entry).themeColors.background
                    }
            } else {
                QuoteWidgetEntryView(entry: entry)
                    .background(QuoteWidgetEntryView(entry: entry).themeColors.background)
            }
        }
        .configurationDisplayName("Stoic Quotes")
        .description("Daily stoic wisdom for your Home & Lock Screen.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge, .accessoryRectangular])
        .contentMarginsDisabled()
    }
}

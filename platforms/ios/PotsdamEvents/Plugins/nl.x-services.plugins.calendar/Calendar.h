#import <Foundation/Foundation.h>
#import <Cordova/CDVPlugin.h>
#import <EventKitUI/EventKitUI.h>
#import <EventKit/EventKit.h>
#import <EventKit/EKAlarm.h>
#import <EventKit/EKEvent.h>
#import <EventKit/EKEventStore.h>

@interface Calendar : CDVPlugin

@property (nonatomic, retain) EKEventStore* eventStore;

- (void)initEventStoreWithCalendarCapabilities;

-(NSArray*)findEKEventsWithTitle: (NSString *)title
                        location: (NSString *)location
                         message: (NSString *)message
                       startDate: (NSDate *)startDate
                         endDate: (NSDate *)endDate
                        calendar: (EKCalendar *) calendar;



- (void)createEvent:(CDVInvokedUrlCommand*)command;

- (void)modifyEvent:(CDVInvokedUrlCommand*)command;

- (void)findEvent:(CDVInvokedUrlCommand*)command;

- (void)deleteEvent:(CDVInvokedUrlCommand*)command;

@end